import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly db: PrismaService) {}

  create(createActivityDto: CreateActivityDto) {}

  findAll() {
    return this.db.activity.findMany();
  }

  findOne(id: string) {
    const activity = this.db.activity.findUnique({ where: { id } });

    if (!activity) throw new NotFoundException('Activity not found');

    return activity;
  }

  update(id: string, updateActivityDto: UpdateActivityDto) {
    return this.db.activity.update({
      where: { id },
      data: updateActivityDto,
    });
  }

  remove(id: string) {
    return this.db.activity.delete({
      where: { id },
    });
  }
}
