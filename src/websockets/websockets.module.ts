import { Module } from '@nestjs/common';
import { TasksGateway } from './tasks.gateway';

@Module({
    providers: [TasksGateway]
})
export class WebsocketsModule {}
