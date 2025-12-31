import { Module } from '@nestjs/common';
import { TaskFilesService } from './task-files.service';
import { TaskFilesController } from './task-files.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TaskFilesService],
  controllers: [TaskFilesController]
})
export class TaskFilesModule {}
