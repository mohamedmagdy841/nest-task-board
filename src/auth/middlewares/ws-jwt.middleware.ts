import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export const wsJwtMiddleware =
  (jwtService: JwtService) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Missing authentication token'));
      }
      
      const payload = await jwtService.verifyAsync(token);

      socket.data.user = payload; // attach user
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  };
