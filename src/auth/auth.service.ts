import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword, verifyPassword } from './utils/hash-password.utils';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { generateResetToken } from './utils/reset-token.utils';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(dto: RegisterUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (existing) {
            throw new ConflictException("User already exists");
        }

        const hashed = await hashPassword(dto.password);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashed,
            }
        });

        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload);

        return accessToken;
    }

    async login(dto: LoginUserDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isMatch = await verifyPassword(user.password, dto.password);
        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload);

        return accessToken;
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

        if (user) {
            const { token, tokenHash } = generateResetToken();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordTokenHash: tokenHash,
                    resetPasswordExpiresAt: expiresAt,
                }
            });

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

            await this.mailService.sendResetPasswordEmail(user.email, resetUrl);

        }

        return { message: "If the email exists, a reset link was sent." };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const tokenHash = require("crypto")
            .createHash("sha256")
            .update(dto.token)
            .digest("hex")

        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordTokenHash: tokenHash,
                resetPasswordExpiresAt: { gt: new Date() },
            }
        });

        if (!user) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        const newHashesPassword = await hashPassword(dto.newPassword);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: newHashesPassword,
                resetPasswordTokenHash: null,
                resetPasswordExpiresAt: null,
            }
        });

        return { message: "Password reset successfully" };
    }
}
