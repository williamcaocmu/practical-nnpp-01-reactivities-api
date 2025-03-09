import {
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
        attendees: true,
      },
    });
    if (!activity) throw new NotFoundException('Activity not found');

    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    user: RequestUser,
  ) {
    const activity = await this.findOne(id);

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

  remove(id: string) {
    return this.db.activity.delete({
      where: { id },
    });
  }
}
