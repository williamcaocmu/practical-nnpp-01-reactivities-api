import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from 'src/common/files/file.service';
import { File } from 'src/common/files/types/file.type';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
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

    // transaction
    return this.db.$transaction(async (tx) => {
      const result = await this.fileService.upload(file);

      await this.db.photo.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          userId: profileId,
        },
      });
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

  async getProfile(profileId: string, observerId: string) {
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
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                displayName: true,
                username: true,
                imageUrl: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                displayName: true,
                username: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const isFollowing =
      observerId === profileId
        ? false
        : profile.followers.some(({ follower }) => follower.id === observerId);

    return {
      ...profile,
      followersCount: profile.followers.length,
      followingCount: profile.following.length,
      followers: undefined,
      following: isFollowing,
    };
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

  async setMainPhoto(photoId: string, userId: string) {
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

      // update user imageUrl
      await tx.user.update({
        where: { id: userId },
        data: { imageUrl: photo.url },
      });
    });
  }

  async follow(targetId: string, observerId: string) {
    const target = await this.db.user.findUnique({ where: { id: targetId } });
    const observer = await this.db.user.findUnique({
      where: { id: observerId },
    });

    if (!target || !observer) {
      throw new NotFoundException('User not found');
    }

    if (targetId === observerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.db.userFollowings.findFirst({
      where: { followerId: observerId, followingId: targetId },
    });

    if (existingFollow) {
      await this.db.userFollowings.delete({
        where: {
          followerId_followingId: {
            followerId: observerId,
            followingId: targetId,
          },
        },
      });
    } else {
      await this.db.userFollowings.create({
        data: {
          followerId: observerId,
          followingId: targetId,
        },
      });
    }
  }

  async getFollowList(profileId: string, predicate: 'followers' | 'following') {
    const profile = await this.db.user.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const commonSelectStatement:
      | Prisma.UserFollowingsSelect['follower']
      | Prisma.UserFollowingsSelect['following'] = {
      select: {
        id: true,
        displayName: true,
        username: true,
        imageUrl: true,
      },
    };

    const selectStatement: Prisma.UserFollowingsSelect =
      predicate === 'followers'
        ? { follower: commonSelectStatement }
        : { following: commonSelectStatement };

    const followList = await this.db.userFollowings.findMany({
      where: { followingId: profileId },
      select: selectStatement,
    });

    return predicate === 'followers'
      ? followList.map((follow) => follow.follower)
      : followList.map((follow) => follow.following);
  }
}
