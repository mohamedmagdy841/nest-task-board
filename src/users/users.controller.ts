import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @Get('me')
    async me(@Request() req) {
        return this.usersService.me(req.user.sub);
    }

}
