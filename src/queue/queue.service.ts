import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('email')
        private readonly emailQueue: Queue,
    ) { }

    async add(
        queueName: string,
        jobName: string,
        data: any,
        options?: {
            attempts?: number,
            delay?: number,
        },
    ) {
        const queueMap = {
            email: this.emailQueue,
        };
        const queue = queueMap[queueName];

        return await queue.add(jobName, data, {
            attempts: options?.attempts ?? 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
            delay: options?.delay,
        });
    };
}
