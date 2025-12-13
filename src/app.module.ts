import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { GlobalExceptionFilter } from './global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      }
    ]),
    PrismaModule,
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    AppService, 
  ],
})
export class AppModule {}
