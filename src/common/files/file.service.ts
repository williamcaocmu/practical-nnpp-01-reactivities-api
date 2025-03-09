import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { File } from './types/file.type';

@Injectable()
export class FileService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async upload(file: File) {
    return this.cloudinaryService.uploadFile(file);
  }

  async delete(publicId: string) {
    return this.cloudinaryService.deleteFile(publicId);
  }
}
