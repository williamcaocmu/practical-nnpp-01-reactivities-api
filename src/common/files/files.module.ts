import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { FileService } from './file.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService, FileService],
  exports: [CloudinaryService, FileService],
})
export class FilesModule {}
