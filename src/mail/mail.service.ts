import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendMail(params: {
        to: string | string[];
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

    async sendTemplateMail(params: {
        to: string | string[];
        subject: string;
        template: string;
        context: Record<string, any>;
        attachments?: {
            filename: string;
            content: string | Buffer;
            contentType?: string;
        }[];
    }) {
        return this.mailerService.sendMail({
            to: params.to,
            subject: params.subject,
            template: params.template,
            context: params.context,
            attachments: params.attachments,
        });
    }

    async sendResetPasswordEmail(to: string, resetUrl: string) {
        return this.mailerService.sendMail({
            to,
            subject: 'Reset Your Password',
            html: `
                <h2>Reset Password</h2>
                <p>Click this link to reset your password (valid for 15 minutes):</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,
        });
    }
}
