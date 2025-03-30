import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { RequestUser } from '../auth/types/request-user.type';
import {
  ActivityPaginationDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { ActivityQueryDto } from './dto/activity-query.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly db: PrismaService) {}

  create(createActivityDto: CreateActivityDto, userId: string) {
    return this.db.activity.create({
      data: {
        ...createActivityDto,
        attendees: {
          create: {
            userId,
            isHost: true,
          },
        },
        hostId: userId,
      },
    });
  }

  async findAll(observerId: string, query: ActivityQueryDto) {
    return this.findAllPaginated(observerId, query);
  }

  async findAllPaginated(observerId: string, params: ActivityQueryDto) {
    const { limit = 2, cursor, isHost, isGoing, startDate } = params;
    const take = Number(limit);

    const filters: Prisma.ActivityWhereInput = {};

    if (startDate) {
      filters.date = {
        gte: startDate ? new Date(startDate) : new Date(),
      };
    }

    // Attendance filters
    const attendeeFilters: Prisma.ActivityAttendeeListRelationFilter = {};

    if (isHost || isGoing) {
      if (isHost) {
        attendeeFilters.some = {
          userId: observerId,
          activity: {
            hostId: observerId,
          },
        };
      } else if (isGoing) {
        attendeeFilters.some = {
          userId: observerId,
        };
      }
    }

    if (Object.keys(attendeeFilters).length > 0) {
      filters.attendees = attendeeFilters;
    }

    const activities = await this.db.activity.findMany({
      take: take + 1,
      ...(cursor && { cursor: { id: cursor } }),
      where: filters,
      orderBy: [{ date: 'desc' }, { id: 'asc' }],
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
            imageUrl: true,
            username: true,
          },
        },
        attendees: {
          select: {
            isHost: true,
            user: {
              select: {
                id: true,
                displayName: true,
                imageUrl: true,
                username: true,
                followers: {
                  select: {
                    follower: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedActivities = activities.map((activity) => ({
      ...activity,
      attendees: activity.attendees.map((attendee) => ({
        id: attendee.user.id,
        displayName: attendee.user.displayName,
        imageUrl: attendee.user.imageUrl,
        username: attendee.user.username,
        isHost: attendee.isHost,
        following: attendee.user.followers
          .map(({ follower }) => follower.id)
          .includes(observerId),
      })),
    }));

    const hasNextPage = formattedActivities.length > take;

    const nextCursor = hasNextPage ? formattedActivities[take].id : null;

    const items = hasNextPage
      ? formattedActivities.slice(0, take)
      : formattedActivities;

    return {
      items,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async findOne(id: string) {
    const activity = await this.db.activity.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            displayName: true,
            imageUrl: true,
            username: true,
          },
        },
        attendees: {
          select: {
            isHost: true,
            user: {
              select: {
                id: true,
                displayName: true,
                imageUrl: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!activity) throw new NotFoundException('Activity not found');

    return {
      ...activity,
      attendees: activity.attendees.map((attendee) => ({
        id: attendee.user.id,
        displayName: attendee.user.displayName,
        imageUrl: attendee.user.imageUrl,
        username: attendee.user.username,
        isHost: attendee.isHost,
      })),
    };
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    user: RequestUser,
  ) {
    const activity = await this.db.activity.findUnique({
      where: { id },
      include: {
        attendees: true,
      },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    const attendance = activity.attendees.find(
      ({ userId }) => userId === user.id,
    );
    const isHost = activity.attendees.some(
      ({ userId, isHost }) => userId === user.id && isHost,
    );
    if (!attendance) throw new NotFoundException('Attendance not found');

    if ('isCancelled' in updateActivityDto) {
      if (!isHost) throw new ForbiddenException('You are not the host');
    }

    const updatedActivity = await this.db.activity.update({
      where: { id },
      data: updateActivityDto,
    });

    return updatedActivity;
  }

  async attend(id: string, user: RequestUser) {
    const activity = await this.db.activity.findUnique({
      where: { id },
      include: {
        attendees: true,
      },
    });

    if (!activity) throw new NotFoundException('Activity not found');

    const attendance = activity.attendees.find(
      ({ userId }) => userId === user.id,
    );
    const isHost = activity.attendees.some(
      ({ userId }) => userId === user.id && activity.hostId === user.id,
    );

    if (isHost) {
      await this.db.activity.update({
        where: { id },
        data: { isCanceled: !activity.isCanceled },
      });
    } else {
      if (attendance) {
        // delete attendance

        await this.db.activityAttendee.delete({
          where: {
            userId_activityId: {
              userId: user.id,
              activityId: id,
            },
          },
        });
      } else {
        // create attendance

        await this.db.activityAttendee.create({
          data: {
            userId: user.id,
            activityId: id,
          },
        });
      }
    }
  }

  async remove(id: string) {
    const activity = await this.db.activity.findUnique({
      where: { id },
    });

    if (!activity) throw new NotFoundException('Activity not found');

    if (activity.isCanceled) {
      throw new BadRequestException('Activity is cancelled');
    }

    return this.db.activity.delete({
      where: { id },
    });
  }
}
