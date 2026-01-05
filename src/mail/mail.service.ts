import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { from } from 'rxjs';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail (params: {
        to: string;
        from: string;
        subject: string;
        message: string;
    }) {
        return this.mailerService.sendMail({
            to: params.to,
            from: params.from,
            subject: params.subject,
            template: 'basic-email',
            context: {
                message: params.message,
                from: params.from,
            },
        });
    }
}
