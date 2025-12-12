import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async me(id: number) {
        const user = await this.prisma.user.findUnique({ 
            where: { id },
            omit: {
                password: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
