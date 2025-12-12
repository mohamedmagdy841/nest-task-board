import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma/client';
import { hashPassword } from './utils/hash-password.utils';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}
    async register(dto: RegisterUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (existing) {
            throw new BadRequestException("User already exists");
        }

        const hashed = await hashPassword(dto.password);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashed,
            }
        });

        const payload = { sub: user.id, email: user.email };
        
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
