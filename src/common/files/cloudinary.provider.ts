import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

export const PROVIDER_NAME = 'Cloudinary';

export const CloudinaryProvider = {
  provide: PROVIDER_NAME,
  useFactory: (configService: ConfigService) => {
    const cloud_name = configService.get('CLOUDINARY_CLOUD_NAME');
    const api_key = configService.get('CLOUDINARY_API_KEY');
    const api_secret = configService.get('CLOUDINARY_API_SECRET');

    const configOptions = {
      cloud_name,
      api_key,
      api_secret,
    } as const satisfies ConfigOptions;

    return cloudinary.config(configOptions);
  },
  inject: [ConfigService],
};
