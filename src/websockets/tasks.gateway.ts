import { UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket, MessageBody, OnGatewayConnection,
    OnGatewayDisconnect, SubscribeMessage,
    WebSocketGateway, WebSocketServer,
    WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsAuthGuard } from "src/auth/guards/ws-auth.guard";
import { JwtService } from "@nestjs/jwt";
import { wsJwtMiddleware } from "src/auth/middlewares/ws-jwt.middleware";
import { OnEvent } from "@nestjs/event-emitter";
import { FILE_UPLOADED, TASK_CREATED, TASK_DELETED, TASK_UPDATED } from "src/tasks/events/task.events";

@WebSocketGateway(8001, {
    namespace: 'tasks-events',
    transports: ['websocket'],
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<number, Set<string>>();

    constructor(private jwtService: JwtService) { }

    afterInit() {
        this.server.use(wsJwtMiddleware(this.jwtService));
    }

    handleConnection(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        const userId = user?.id || user?.sub;
        if (!userId) {
            client.disconnect();
            return;
        }

        client.join(`user:${userId}`);

        const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
        const isFirestConnection = sockets.size === 0;
        sockets.add(client.id);
        this.onlineUsers.set(userId, sockets);

        client.emit(
            'presence.list',
            Array.from(this.onlineUsers.keys()),
        );

        if (isFirestConnection) {
            client.broadcast.emit('user.online', userId);
        }

        console.log(`User ${userId} connected with socket ${client.id}`);
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        const userId = user?.id || user?.sub;

        if (!userId) return;

        const sockets = this.onlineUsers.get(userId);
        if (!sockets) return;

        sockets.delete(client.id);

        if (sockets.size === 0) {
            this.onlineUsers.delete(userId);
            client.broadcast.emit('user.offline', userId);
            console.log(`User ${userId} went offline`);
        } else {
            this.onlineUsers.set(userId, sockets);
        }

        console.log(`Socket ${client.id} disconnected for user ${userId}`);
    }


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