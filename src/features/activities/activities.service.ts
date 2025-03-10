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
import { CursorPaginationService } from 'src/common/querying/cursor-pagination/cursor-pagination.service';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly db: PrismaService,
    private readonly cursorPaginationService: CursorPaginationService,
  ) {}

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
      },
    });
  }

  async findAll() {
    // Redirect to paginated version with default parameters
    return this.findAllPaginated({});
  }

  async findAllPaginated(params: ActivityPaginationDto) {
    const { limit = 2, cursor, category, isHost, isGoing, startDate } = params;

    // Build filters
    const filters: Prisma.ActivityWhereInput = {};

    if (category) {
      filters.category = category;
    }

    if (startDate) {
      filters.date = {
        gte: startDate,
      };
    }

    // Attendance filters
    const attendeeFilters: any = {};

    if (isHost || isGoing) {
      if (!params['userId']) {
        throw new BadRequestException(
          'userId is required when using isHost or isGoing filters',
        );
      }

      if (isHost) {
        attendeeFilters.some = {
          userId: params['userId'],
          isHost: true,
        };
      } else if (isGoing) {
        attendeeFilters.some = {
          userId: params['userId'],
        };
      }

      if (Object.keys(attendeeFilters).length > 0) {
        filters.attendees = attendeeFilters;
      }
    }

    const { cursor: cursorParams, take } =
      this.cursorPaginationService.generateCursor(cursor, limit);

    const activities = await this.db.activity.findMany({
      take,
      cursor: cursorParams,
      where: filters,
      orderBy: [{ date: 'desc' }, { id: 'asc' }],
      include: {
        host: {
          select: {
            displayName: true,
          },
        },
        attendees: {
          select: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    const { hasNextPage, nextCursor, items } =
      this.cursorPaginationService.getMetadata(activities, limit);

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
        ...attendee.user,
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
      ({ userId, isHost }) => userId === user.id && isHost,
    );

    if (isHost) {
      //  if host, cancel activity
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
