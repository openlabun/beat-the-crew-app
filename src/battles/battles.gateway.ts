import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // tighten to your frontend URL in production
})
export class BattlesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(BattlesGateway.name);
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Voting is now open — vote page unlocks buttons
  emitVotingOpened(payload: { battleId: number; yellow: string; purple: string }) {
    this.logger.log(`Voting opened for battle: ${payload.battleId}`);
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
    this.logger.log(`Battle winner announced for battle: ${payload.battleId}, winner: ${payload.winnerName}`);
    this.server.emit('battle:winner', payload);
  }

  // Admin announced a tie — big screen shows tie message
  emitTie(payload: { battleId: number; yellow: string; purple: string }) {
    this.logger.log(`Battle ended in a tie: ${payload.battleId}`);
    this.server.emit('battle:tie', payload);
  }

  // Admin triggered rerun after hyping the tie — vote page resets
  emitRerun(payload: { battleId: number; yellow: string; purple: string }) {
    this.logger.log(`Battle rerun triggered: ${payload.battleId}`);
    this.server.emit('battle:rerun', payload);
  }

  // Live tally — only admin panel listens to this
  emitVotesUpdated(payload: { battleId: number; yellowVotes: number; purpleVotes: number }) {
    this.logger.log(`Votes updated for battle: ${payload.battleId}`);
    this.server.emit('votes:updated', payload);
  }
}