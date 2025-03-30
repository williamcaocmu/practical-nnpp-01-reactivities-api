import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'nestjs-prisma';
import { CommentQueryDto } from './dto/comment-query.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly db: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { body, activityId } = createCommentDto;

    const activity = await this.db.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const comment = await this.db.comment.create({
      data: {
        body,
        activity: { connect: { id: activityId } },
        user: { connect: { id: userId } },
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            imageUrl: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      displayName: comment.user.displayName,
      imageUrl: comment.user.imageUrl,
    };
  }

  async findAll(query: CommentQueryDto) {
    const { activityId } = query;

    console.log(activityId);

    const activity = await this.db.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const comments = await this.db.comment.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, displayName: true, imageUrl: true },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      displayName: comment.user.displayName,
      imageUrl: comment.user.imageUrl,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
