import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "src/mail/mail.service";

@Processor('email', {
    concurrency: 2,
    limiter: {
        max: 10,
        duration: 1000,
    }
})
export class EmailProcessor extends WorkerHost {
    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case 'send-email':
                return this.handleSendEmail(job.data);
        }
    }

    private async handleSendEmail(data: {
        to: string,
        from: string,
        subject: string,
        message: string,
    }) {
        await this.mailService.sendMail(data);
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name}...`,
        );
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`Job ${job.id} has been completed.`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        console.error(`Job ${job.id} has failed with error: ${err.message}`);
    }
}