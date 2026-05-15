import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // tighten to your frontend URL in production
})
export class ScreenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ScreenGateway.name);
  @WebSocketServer()
  server: Server;

  // Track connected screens separately
  private connectedScreens: Set<string> = new Set();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedScreens.delete(client.id);
  }

  // Admin sends a screen command (show_logo, show_bracket)
  @SubscribeMessage('screen:command')
  handleScreenCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: string,
  ) {
    this.logger.log(`Screen command received: ${command}`);
    // Broadcast to all connected clients
    this.server.emit('screen:command', command);
  }

  // Admin sends a group command (CREW, INVITED)
  @SubscribeMessage('screen:group')
  handleScreenGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() group: string,
  ) {
    this.logger.log(`Screen group command received: ${group}`);
    // Broadcast to all connected clients
    this.server.emit('screen:group', group);
  }

  // Optional: Helper method to emit screen commands from other services
  emitScreenCommand(command: string) {
    this.logger.log(`Emitting screen command: ${command}`);
    this.server.emit('screen:command', command);
  }

  // Optional: Helper method to emit group commands from other services
  emitScreenGroup(group: string) {
    this.logger.log(`Emitting screen group: ${group}`);
    this.server.emit('screen:group', group);
  }
}