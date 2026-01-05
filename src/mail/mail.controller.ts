import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SendEmailDto } from './dto/send-email.dto';
import type { Request } from 'express';

@Controller()
export class MailController {
    constructor(private readonly mailService: MailService) {}
    
    @UseGuards(AuthGuard)
    @Post('send-email')
    async sendEmail(
        @Body() dto: SendEmailDto,
        @Req() request: Request,
    ) {
        const user = request['user'];

        await this.mailService.sendMail({
            to: dto.to,
            from: user.email,
            subject: dto.subject,
            message: dto.message,
        });

        return { message: 'Email sent successfully' };
    }
}
