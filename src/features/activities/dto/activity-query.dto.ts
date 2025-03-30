import { Optional } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

export class ActivityQueryDto {
  @IsOptional()
  @IsString()
  cursor: string;

  @Optional()
  limit: string;

  @IsOptional()
  @IsString()
  isHost: string;

  @IsOptional()
  @IsString()
  isGoing: string;

  @IsOptional()
  @IsString()
  startDate: string;
}
