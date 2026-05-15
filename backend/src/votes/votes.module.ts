import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { BattlesModule } from '../battles/battles.module';

@Module({
  imports: [BattlesModule], // needed to inject BattlesGateway
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}