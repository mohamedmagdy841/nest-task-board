import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('me')
    async me(@Request() req) {
        return this.usersService.me(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
}
