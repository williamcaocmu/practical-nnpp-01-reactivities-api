import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/pagination/cursor-pagination/cursor-pagination.decorator';

export class ActivityPaginationDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHost?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isGoing?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class PaginatedActivityResult<T> {
  items: T[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
