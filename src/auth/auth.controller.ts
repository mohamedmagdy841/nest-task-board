import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

@Throttle({ default: { limit: 3, ttl: 60000 } })
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUserDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const accessToken = await this.authService.register(registerUserDto);

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60, // 1 hour
        });

        return { message: 'Registration successful' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = await this.authService.login(loginUserDto);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60, // 1 hour
        });

        return { message: 'Login successful' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return { message: 'Logout successful' };
    }
}
