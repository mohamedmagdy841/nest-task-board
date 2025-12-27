import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export const wsJwtMiddleware =
  (jwtService: JwtService) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const authHeader = socket.handshake.headers.authorization as
        | string
        | undefined;

      if (!authHeader?.startsWith('Bearer ')) {
        return next(new Error('Missing authentication token'));
      }

      const token = authHeader.split(' ')[1];
      const payload = await jwtService.verifyAsync(token);

      socket.data.user = payload; // attach user
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  };
