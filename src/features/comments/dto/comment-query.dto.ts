import { IsString } from 'class-validator';

export class CommentQueryDto {
  @IsString()
  activityId: string;
}
