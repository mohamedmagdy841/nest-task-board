import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword, verifyPassword } from './utils/hash-password.utils';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

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

    async login(dto: LoginUserDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email }});
        if (!user) {
            throw new BadRequestException("Invalid credentials");
        }

        const isMatch = await verifyPassword(user.password, dto.password);
        if (!isMatch) {
            throw new BadRequestException("Invalid credentials");
        }

        const payload = { sub: user.id, email: user.email };
        
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
