import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './files/file.service';
import { CursorPaginationService } from './querying/cursor-pagination/cursor-pagination.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({ isGlobal: true }),

    FilesModule,
  ],
  providers: [FileService, CursorPaginationService],
  exports: [PrismaModule, FileService, CursorPaginationService],
})
export class CommonModule {}
