import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { BattlesModule } from './battles/battles.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventsModule,
    BattlesModule,
    VotesModule,
  ],
})
export class AppModule {}