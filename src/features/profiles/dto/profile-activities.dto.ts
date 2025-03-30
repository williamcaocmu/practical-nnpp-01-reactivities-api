import { IsEnum, IsOptional } from 'class-validator';

export class ProfileActivitiesQueryDto {
  @IsOptional()
  @IsEnum(['past', 'hosting', 'future'])
  filter: 'past' | 'hosting' | 'future';
}
