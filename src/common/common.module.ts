import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './files/file.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({ isGlobal: true }),
    FilesModule,
  ],
  providers: [FileService],
  exports: [PrismaModule, FileService],
})
export class CommonModule {}
