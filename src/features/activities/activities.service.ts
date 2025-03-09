import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { RequestUser } from '../auth/types/request-user.type';

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
      },
    });
  }

  async findAll() {
    const activities = await this.db.activity.findMany({
      orderBy: {
        date: 'desc',
      },
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

    return activities;
  }

  async findOne(id: string) {
    const activity = await this.db.activity.findUnique({
      where: { id },
      include: {
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
    if (activity.isCanceled)
      throw new BadRequestException('Activity is cancelled');
    const attendance = activity.attendees.find(
      ({ userId }) => userId === user.id,
    );
    if (attendance) throw new BadRequestException('You are already attending');
    if (activity.hostId === user.id)
      throw new BadRequestException('You cannot attend your own activity');

    await this.db.activityAttendee.create({
      data: {
        userId: user.id,
        activityId: id,
      },
    });
  }

  remove(id: string) {
    return this.db.activity.delete({
      where: { id },
    });
  }
}
