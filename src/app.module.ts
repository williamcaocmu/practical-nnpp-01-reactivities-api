import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ActivitiesModule } from './features/activities/activities.module';
import { ProfilesModule } from './features/profiles/profiles.module';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [CommonModule, ActivitiesModule, UsersModule, ProfilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
