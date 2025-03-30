import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PublicRoute } from '../auth/decorators/public.decorator';
import { User } from '../auth/decorators/user.decorator';
import { RequestUser } from '../auth/types/request-user.type';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @User() { id }: RequestUser,
  ) {
    return this.activitiesService.create(createActivityDto, id);
  }

  @Get()
  async findAll(@User() user: RequestUser, @Query() query: ActivityQueryDto) {
    return this.activitiesService.findAll(user.id, query);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/attend')
  attend(@Param('id') id: string, @User() user: RequestUser) {
    return this.activitiesService.attend(id, user);
  }

  @PublicRoute()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @User() user: RequestUser,
  ) {
    return this.activitiesService.update(id, updateActivityDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
