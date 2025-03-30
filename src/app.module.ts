import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ActivitiesModule } from './features/activities/activities.module';
import { ProfilesModule } from './features/profiles/profiles.module';
import { UsersModule } from './features/users/users.module';
import { APP_PIPE } from '@nestjs/core';
import { CommentsModule } from './features/comments/comments.module';

@Module({
  imports: [
    CommonModule,
    ActivitiesModule,
    UsersModule,
    ProfilesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
