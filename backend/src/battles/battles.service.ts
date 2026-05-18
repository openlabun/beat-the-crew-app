import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BattlesGateway } from './battles.gateway';

@Injectable()
export class BattlesService {
  private readonly logger = new Logger(BattlesService.name);
  private activeTimers = new Map<number, NodeJS.Timeout>()
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BattlesGateway,
  ) {}

  async getBattle(battleId: number) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { yellowContestant: true, purpleContestant: true, winner: true },
    });
    if (!battle) throw new NotFoundException('Battle not found');
    return battle;
  }

  async getCurrentBattle() {
    return this.prisma.battle.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      include: { yellowContestant: true, purpleContestant: true },
    })
  }

  async openVoting(battleId: number) {
    // Clear any existing timer for any battle first
    this.activeTimers.forEach((timer) => clearInterval(timer))
    this.activeTimers.clear()

    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');

    if (!battle.yellowContestantId || !battle.purpleContestantId) {
      throw new BadRequestException('Battle does not have two contestants yet');
    }
    if (battle.votingOpen) {
      throw new BadRequestException('Voting is already open');
    }
    if (battle.winnerId) {
      throw new BadRequestException('Battle already has a winner');
    }

    const updated = await this.prisma.battle.update({
      where: { id: battleId },
      data: { votingOpen: true, active: true },
      include: { yellowContestant: true, purpleContestant: true },
    });

    this.gateway.emitVotingOpened({
      battleId: updated.id,
      yellow: updated.yellowContestant!.name,
      purple: updated.purpleContestant!.name,
    });

    // Countdown ticker
    let secondsLeft = 30
    const ticker = setInterval(async () => {
      secondsLeft--
      this.gateway.emitVotingTick({ battleId, secondsLeft })

      if (secondsLeft <= 0) {
        clearInterval(ticker)
        const current = await this.prisma.battle.findUnique({ where: { id: battleId } })
        if (current?.votingOpen) {
          await this.closeVoting(battleId)
        }
      }
    }, 1000)

    // Store ticker so manual close can cancel it
    this.activeTimers.set(battleId, ticker)

    return updated;
  }

  async closeVoting(battleId: number) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { yellowContestant: true, purpleContestant: true },
    });
    if (!battle) throw new NotFoundException('Battle not found');
    if (!battle.votingOpen) throw new BadRequestException('Voting is not open');

    // Determine winner or tie — store result silently, emit nothing
    const isTie = battle.yellowVotes === battle.purpleVotes;

    this.logger.log(`Closing voting for battle ${battleId}. Yellow: ${battle.yellowVotes}, Purple: ${battle.purpleVotes}.`);
    this.gateway.emitVotingClosed({ battleId })

    return this.prisma.battle.update({
      where: { id: battleId },
      data: { votingOpen: false },
      include: { yellowContestant: true, purpleContestant: true },
    });
  }

  // Admin hits this when ready to reveal — builds suspense
  async announce(battleId: number) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { yellowContestant: true, purpleContestant: true, winner: true },
    });
    if (!battle) throw new NotFoundException('Battle not found');
    if (battle.votingOpen) throw new BadRequestException('Voting is still open');

    const isTie = battle.yellowVotes === battle.purpleVotes;

    if (isTie) {
      this.gateway.emitTie({
        battleId,
        yellow: battle.yellowContestant!.name,
        purple: battle.purpleContestant!.name,
      });
      return battle;
    }

    // Determine winner from votes
    const winnerId = battle.yellowVotes > battle.purpleVotes
      ? battle.yellowContestantId!
      : battle.purpleContestantId!;

    // Set winner and clear active
    const updated = await this.prisma.battle.update({
      where: { id: battleId },
      data: { winnerId, active: false },
      include: { yellowContestant: true, purpleContestant: true, winner: true },
    });

    // Advance winner to next battle
    await this.advanceWinner(
      battle.eventId,
      battle.group,
      battle.round,
      battle.position,
      winnerId,
    );

    this.gateway.emitBattleWinner({
      battleId: battle.id,
      winnerId,
      winnerName: updated.winner!.name,
      yellowVotes: battle.yellowVotes,
      purpleVotes: battle.purpleVotes,
    });

    return updated;
  }

  // Admin hits this after hyping up the tie — resets battle for another round
  async rerun(battleId: number) {
    const battle = await this.prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw new NotFoundException('Battle not found');
    if (battle.winnerId !== null) throw new BadRequestException('Battle already has a winner');
    if (battle.votingOpen) throw new BadRequestException('Close voting before rerunning');

    const [updated] = await this.prisma.$transaction([
      this.prisma.battle.update({
        where: { id: battleId },
        data: { yellowVotes: 0, purpleVotes: 0, active: false },
        include: { yellowContestant: true, purpleContestant: true },
      }),
      this.prisma.voteSession.deleteMany({ where: { battleId } }),
    ]);

    this.gateway.emitRerun({
      battleId,
      yellow: updated.yellowContestant!.name,
      purple: updated.purpleContestant!.name,
    });

    this.logger.log(`Rerunning battle ${battleId} due to tie. Votes reset.`);

    return updated;
  }

  private async advanceWinner(
    eventId: number,
    group: string,
    round: number,
    position: number,
    winnerId: number,
  ) {
    const nextRound = round + 1;
    const nextPosition = Math.ceil(position / 2);

    const nextBattle = await this.prisma.battle.findUnique({
      where: {
        eventId_group_round_position: {
          eventId,
          group: group as any,
          round: nextRound,
          position: nextPosition,
        },
      },
    });

    if (!nextBattle) return;

    const isOddPosition = position % 2 !== 0;
    await this.prisma.battle.update({
      where: { id: nextBattle.id },
      data: isOddPosition
        ? { yellowContestantId: winnerId }
        : { purpleContestantId: winnerId },
    });
  }

  async getActiveBattle(eventId: number) {
    return this.prisma.battle.findFirst({
      where: { eventId, active: true },
      include: { yellowContestant: true, purpleContestant: true },
    });
  }

  async getLiveTally(battleId: number) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      select: { yellowVotes: true, purpleVotes: true, votingOpen: true },
    });
    if (!battle) throw new NotFoundException('Battle not found');
    return battle;
  }

  async forfeit(battleId: number, side: 'yellow' | 'purple') {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
      include: { yellowContestant: true, purpleContestant: true },
    });
    if (!battle) throw new NotFoundException('Battle not found');
    if (battle.winnerId) throw new BadRequestException('Battle already has a winner');
    if (!battle.yellowContestantId || !battle.purpleContestantId) {
      throw new BadRequestException('Battle does not have two contestants yet');
    }

    // If voting is open, close it first before forfeiting
    if (battle.votingOpen) {
      const existingTimer = this.activeTimers.get(battleId)
      if (existingTimer) {
        clearInterval(existingTimer)
        this.activeTimers.delete(battleId)
      }
    }

    const winnerId = side === 'yellow'
      ? battle.purpleContestantId
      : battle.yellowContestantId;

    const forfeitingName = side === 'yellow'
      ? battle.yellowContestant!.name
      : battle.purpleContestant!.name;

    const winnerName = side === 'yellow'
      ? battle.purpleContestant!.name
      : battle.yellowContestant!.name;

    const updated = await this.prisma.battle.update({
      where: { id: battleId },
      data: { winnerId, active: false, votingOpen: false },
      include: { yellowContestant: true, purpleContestant: true, winner: true },
    });

    await this.advanceWinner(
      battle.eventId,
      battle.group,
      battle.round,
      battle.position,
      winnerId,
    );

    this.gateway.emitForfeit({ battleId, forfeitingName, winnerName });
    this.logger.log(`Battle ${battleId} forfeited by ${forfeitingName}. Winner: ${winnerName}.`);
    return updated;
  }
}