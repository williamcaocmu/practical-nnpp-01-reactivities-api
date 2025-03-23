import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'src/common/files/types/file.type';
import { RequestUser } from '../auth/types/request-user.type';
import { User } from '../auth/decorators/user.decorator';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post('photo')
  uploadPhoto(@User() user: RequestUser, @UploadedFile() file: File) {
    return this.profilesService.uploadPhoto(user.id, file);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('photo/:id')
  deletePhoto(@Param('id') id: string) {
    return this.profilesService.deletePhoto(id);
  }

  @Put('photo/:id/main')
  setMainPhoto(@Param('id') id: string, @User() user: RequestUser) {
    return this.profilesService.setMainPhoto(id, user.id);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.profilesService.getProfile(id);
  }

  @Get(':id/photos')
  getPhotos(@Param('id') id: string) {
    return this.profilesService.getPhotos(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/follow')
  follow(@Param('id') id: string, @User() user: RequestUser) {
    return this.profilesService.follow(id, user.id);
  }

  @Get(':id/follow-list')
  getFollowList(
    @Param('id') id: string,
    @Query('predicate') predicate: 'followers' | 'following',
  ) {
    return this.profilesService.getFollowList(id, predicate);
  }
}
