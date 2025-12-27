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

@UseGuards(WsAuthGuard)
@WebSocketGateway(8001, {
    namespace: 'tasks-events',
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
        console.log("New user connected:", client.id);

        // broadcast to all but the sender
        client.broadcast.emit("reply", {
            message: `New User Joined the chat: ${client.id}` 
        });

        // this.server.emit("reply", {
        //     message: `New User Joined the chat: ${client.id}`
        // });
    }

    // on disconnect lifecycle hooks
    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log("user disconnected:", client.id);
        this.server.emit("reply", {
            message: `User Left the chat: ${client.id}`
        });
    }

    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors) =>
                new WsException({
                    message: 'Validation failed',
                    errors,
                })
        })
    )
    @SubscribeMessage('events')
    handleEvent(
        @ConnectedSocket() client: Socket, 
        @MessageBody() message: EventDto
    ) {
        // client.emit('reply', 'This is a reply'); // send back to single client
        this.server.emit('reply', message); // broadcast the message to all subscribers
    }

}