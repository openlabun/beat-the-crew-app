import { Module } from '@nestjs/common';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { BattlesGateway } from './battles.gateway';

@Module({
  controllers: [BattlesController],
  providers: [BattlesService, BattlesGateway],
  exports: [BattlesGateway], // exported so votes module can use it
})
export class BattlesModule {}