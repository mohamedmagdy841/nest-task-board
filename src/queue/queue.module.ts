import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
    ),
  ],
  providers: [
    QueueService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
