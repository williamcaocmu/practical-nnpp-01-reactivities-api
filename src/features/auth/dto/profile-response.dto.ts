import { IsString } from 'class-validator';

export class ProfileResponseDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  displayName: string;

  @IsString()
  imageUrl: string | null;
}

export class ProfileResponseMapperDto {
  user: ProfileResponseDto;

  constructor(private readonly profile: ProfileResponseDto) {
    this.user = {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      imageUrl: profile.imageUrl,
    };
  }
}
