import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    // =========================
    // OPTION 1 (Postman / headers)
    // =========================
    const authHeader = client.handshake.headers?.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    // =========================
    // OPTION 2 (Browser / Socket.IO auth)
    // =========================
    // const token = client.handshake.auth?.token;

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload; // attach user to socket
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new WsException('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new WsException('Invalid authentication token');
      }

      throw new WsException('Authentication failed');
    }
  }
}
