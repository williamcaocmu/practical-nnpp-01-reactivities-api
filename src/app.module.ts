import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivitiesModule } from './features/activities/activities.module';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [
    PrismaModule.forRoot({ isGlobal: true }),
    ActivitiesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
