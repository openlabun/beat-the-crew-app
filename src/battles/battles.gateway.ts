import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // tighten to your frontend URL in production
})
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Voting is now open — vote page unlocks buttons
  emitVotingOpened(payload: { battleId: number; yellow: string; purple: string }) {
    this.server.emit('voting:opened', payload);
  }

  // Admin revealed the winner
  emitBattleWinner(payload: {
    battleId: number;
    winnerId: number;
    winnerName: string;
    yellowVotes: number;
    purpleVotes: number;
  }) {
    this.server.emit('battle:winner', payload);
  }

  // Admin announced a tie — big screen shows tie message
  emitTie(payload: { battleId: number; yellow: string; purple: string }) {
    this.server.emit('battle:tie', payload);
  }

  // Admin triggered rerun after hyping the tie — vote page resets
  emitRerun(payload: { battleId: number; yellow: string; purple: string }) {
    this.server.emit('battle:rerun', payload);
  }

  // Live tally — only admin panel listens to this
  emitVotesUpdated(payload: { battleId: number; yellowVotes: number; purpleVotes: number }) {
    this.server.emit('votes:updated', payload);
  }
}