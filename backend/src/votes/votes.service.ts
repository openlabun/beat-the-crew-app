import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BattlesGateway } from '../battles/battles.gateway';
import { CastVoteDto } from './dto/cast-vote.dto';
import { VoteChoice } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BattlesGateway,
  ) {}

  async castVote(dto: CastVoteDto) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: dto.battleId },
    });

    if (!battle) throw new BadRequestException('Battle not found');
    if (!battle.votingOpen) throw new BadRequestException('Voting is not open');

    // Atomic transaction: insert VoteSession + increment counter
    try {
      const [voteSession, updatedBattle] = await this.prisma.$transaction([
        this.prisma.voteSession.create({
          data: {
            battleId: dto.battleId,
            userId: dto.userId,
            votedFor: dto.votedFor,
          },
        }),
        this.prisma.battle.update({
          where: { id: dto.battleId },
          data:
            dto.votedFor === VoteChoice.YELLOW
              ? { yellowVotes: { increment: 1 } }
              : { purpleVotes: { increment: 1 } },
          select: { yellowVotes: true, purpleVotes: true },
        }),
      ]);

      // Emit updated tally to admin
      this.gateway.emitVotesUpdated({
        battleId: dto.battleId,
        yellowVotes: updatedBattle.yellowVotes,
        purpleVotes: updatedBattle.purpleVotes,
      });

      return { success: true };
    } catch (error: any) {
      // Prisma unique constraint violation = double vote
      if (error.code === 'P2002') {
        throw new ConflictException('You have already voted in this battle');
      }
      throw error;
    }
  }
}