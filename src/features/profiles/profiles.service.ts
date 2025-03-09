import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/common/files/file.service';
import { File } from 'src/common/files/types/file.type';
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

  async getProfile(profileId: string) {
    const profile = await this.db.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        imageUrl: true,
        photos: {
          select: {
            id: true,
            url: true,
            isMain: true,
            publicId: true,
          },
        },
      },
    });

    return profile;
  }

  async getPhotos(profileId: string) {
    const profile = await this.db.user.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const photos = await this.db.photo.findMany({
      where: { userId: profileId },
      select: {
        id: true,
        url: true,
        isMain: true,
        publicId: true,
      },
    });

    return photos;
  }

  async setMainPhoto(photoId: string) {
    const photo = await this.db.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.isMain) return;

    return this.db.$transaction(async (tx) => {
      await tx.photo.updateMany({
        where: { userId: photo.userId },
        data: { isMain: false },
      });

      await tx.photo.update({
        where: { id: photoId },
        data: { isMain: true },
      });
    });
  }
}
