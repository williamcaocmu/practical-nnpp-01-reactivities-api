import { Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

type ActivityCreateInput = Omit<
  Prisma.ActivityCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'hostId' | 'host'
>;

export class CreateActivityDto implements ActivityCreateInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  venue: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsBoolean()
  @IsOptional()
  isCancelled?: boolean;
}
