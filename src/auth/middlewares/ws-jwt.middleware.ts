import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

export const wsJwtMiddleware =
  (jwtService: JwtService) =>
    async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
          return next(new Error('Missing cookies'));
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.access_token;

        if (!token) {
          return next(new Error('Missing access token'));
        }

        const payload = await jwtService.verifyAsync(token);

        socket.data.user = payload;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    };
