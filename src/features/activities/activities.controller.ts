import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { PublicRoute } from '../auth/decorators/public.decorator';
import { User } from '../auth/decorators/user.decorator';
import { RequestUser } from '../auth/types/request-user.type';

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

  @PublicRoute()
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/attend')
  attend(@Param('id') id: string, @User() user: RequestUser) {
    return this.activitiesService.attend(id, user);
  }

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
