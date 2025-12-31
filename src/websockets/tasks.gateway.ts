import { UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { 
    ConnectedSocket, MessageBody, OnGatewayConnection, 
    OnGatewayDisconnect, SubscribeMessage, 
    WebSocketGateway, WebSocketServer, 
    WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EventDto } from "./dto/event.dto";
import { WsAuthGuard } from "src/auth/guards/ws-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { wsJwtMiddleware } from "src/auth/middlewares/ws-jwt.middleware";
import { OnEvent } from "@nestjs/event-emitter";
import { FILE_UPLOADED, TASK_CREATED, TASK_DELETED, TASK_UPDATED } from "src/tasks/events/task.events";

@UseGuards(WsAuthGuard)
@WebSocketGateway(8001, {
    namespace: 'tasks-events',
    transports: ['websocket'],
    cors: {
        origin: '*',
    },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private jwtService: JwtService) {}

    afterInit() {
        this.server.use(wsJwtMiddleware(this.jwtService));
    }

    // on connect lifecycle hooks
    handleConnection(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        const userId = user?.id || user?.sub;
        if (!userId) {
            client.disconnect();
            return;
        }

        client.join(`user:${userId}`);

        console.log(`User ${userId} connected with socket ${client.id}`);
    }

    // on disconnect lifecycle hooks
    handleDisconnect(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        const userId = user?.id || user?.sub;
        console.log(`User ${userId} disconnected (${client.id})`);
    }

    // @UsePipes(
    //     new ValidationPipe({
    //         whitelist: true,
    //         transform: true,
    //         exceptionFactory: (errors) =>
    //             new WsException({
    //                 message: 'Validation failed',
    //                 errors,
    //             })
    //     })
    // )
    // @SubscribeMessage('events')
    // handleEvent(
    //     @ConnectedSocket() client: Socket, 
    //     @MessageBody() message: EventDto
    // ) {
    //     // client.emit('reply', 'This is a reply'); // send back to single client
    //     this.server.emit('reply', message); // broadcast the message to all subscribers
    // }

    
    @OnEvent(TASK_CREATED)
    handleTaskCreated(payload: { task: any; actorId: number }) {
        this.server
        .except(`user:${payload.actorId}`)
        .emit(TASK_CREATED, payload.task);
    }

    @OnEvent(TASK_UPDATED)
    handleTaskUpdated(payload: { task: any; actorId: number }) {        
        this.server
        .except(`user:${payload.actorId}`)
        .emit(TASK_UPDATED, payload.task);
    }

    @OnEvent(TASK_DELETED)
    handleTaskDeleted(payload: { task: any; actorId: number }) {
        this.server
        .except(`user:${payload.actorId}`)
        .emit(TASK_DELETED, payload.task);
    }

    @OnEvent(FILE_UPLOADED)
    handleFileUploaded(payload: { fileRecord: any; actorId: number }) {
        this.server
        .except(`user:${payload.actorId}`)
        .emit(FILE_UPLOADED, payload.fileRecord);
    }
}