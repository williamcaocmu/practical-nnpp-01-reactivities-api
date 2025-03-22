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
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import {
  ActivityPaginationDto,
  CreateActivityDto,
  UpdateActivityDto,
} from './dto';
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

  @PublicRoute()
  @Get('paginated')
  findAllPaginated(
    @Query() query: ActivityPaginationDto,
    @User() user?: RequestUser,
  ) {
    // Add user ID to params if user is authenticated and using isHost/isGoing filters
    if (user && (query.isHost || query.isGoing)) {
      return this.activitiesService.findAllPaginated({
        ...query,
        userId: user.id,
      });
    }
    return this.activitiesService.findAllPaginated(query);
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
