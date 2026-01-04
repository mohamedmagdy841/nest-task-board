import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis() {
    const pubClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    const subClient = pubClient.duplicate();

    pubClient.on('ready', () => {
      this.logger.log('Redis pub client connected');
    });

    subClient.on('ready', () => {
      this.logger.log('Redis sub client connected');
    });

    pubClient.on('error', (err) => {
      this.logger.error('Redis pub client error', err);
    });

    subClient.on('error', (err) => {
      this.logger.error('Redis sub client error', err);
    });

    await Promise.all([
      pubClient.connect(),
      subClient.connect(),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);

    this.logger.log('Socket.IO Redis adapter initialized');
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      transports: ['websocket'],
    });

    server.adapter(this.adapterConstructor);
    return server;
  }
}
