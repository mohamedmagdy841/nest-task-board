import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma/client';
import { hashPassword } from './utils/hash-password.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}
    async register(data: Prisma.UserCreateInput) {
        const {email, name, password} = data;
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (user) {
            throw new HttpException("User already exists", 400);
        }

        const hashedPassword = await hashPassword(password);

        const payload = { sub: email };
        
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
