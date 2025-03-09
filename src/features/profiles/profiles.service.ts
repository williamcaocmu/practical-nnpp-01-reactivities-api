import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/common/files/file.service';
import { File } from 'src/common/files/types/file.type';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly fileService: FileService,
    private readonly db: PrismaService,
  ) {}

  async uploadPhoto(profileId: string, file: File) {
    const profile = await this.db.user.findUnique({ where: { id: profileId } });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const result = await this.fileService.upload(file);

    await this.db.photo.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        userId: profileId,
      },
    });
  }

  async deletePhoto(photoId: string) {
    const photo = await this.db.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return this.db.$transaction(async (tx) => {
      await tx.photo.delete({ where: { id: photo.id } });
      await this.fileService.delete(photo.publicId);
    });
  }

  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findAll() {
    return `This action returns all profiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
