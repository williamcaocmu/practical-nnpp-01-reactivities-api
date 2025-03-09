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

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
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

  @IsString()
  @IsNotEmpty()
  hostId: string;

  @IsBoolean()
  @IsOptional()
  isCancelled?: boolean;
}
