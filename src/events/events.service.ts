import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContestantGroup } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { AddContestantsDto } from './dto/add-contestants.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: { name: dto.name },
    });
  }

  async getEvent(eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { contestants: true, battles: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async addContestants(eventId: number, dto: AddContestantsDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    // Check no contestants already exist for this group
    const existing = await this.prisma.contestant.count({
      where: { eventId, group: dto.group },
    });
    if (existing > 0) {
      throw new BadRequestException(`Contestants for group ${dto.group} already added`);
    }

    const data = dto.names.map((name, index) => ({
      name,
      group: dto.group,
      eventId,
      seed: index + 1,
    }));

    return this.prisma.contestant.createMany({ data });
  }

  async generateBracket(eventId: number, group: ContestantGroup) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const contestants = await this.prisma.contestant.findMany({
      where: { eventId, group },
    });

    if (contestants.length < 2) {
      throw new BadRequestException('Need at least 2 contestants to generate a bracket');
    }

    if ((contestants.length & (contestants.length - 1)) !== 0) {
      throw new BadRequestException('Number of contestants must be a power of 2 (2, 4, 8, 16)');
    }

    // Check bracket not already generated
    const existingBattles = await this.prisma.battle.count({
      where: { eventId, group },
    });
    if (existingBattles > 0) {
      throw new BadRequestException(`Bracket for group ${group} already generated`);
    }

    // Shuffle contestants (Fisher-Yates)
    const shuffled = [...contestants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Generate all battles for all rounds
    // Round 1: pair shuffled contestants
    // Later rounds: slots are empty until winners advance
    const totalRounds = Math.log2(contestants.length);
    const battlesToCreate: {
      eventId: number;
      group: ContestantGroup;
      round: number;
      position: number;
      yellowContestantId?: number;
      purpleContestantId?: number;
    }[] = [];

    // Round 1 battles with actual contestants
    for (let i = 0; i < shuffled.length; i += 2) {
      battlesToCreate.push({
        eventId,
        group,
        round: 1,
        position: Math.floor(i / 2) + 1,
        yellowContestantId: shuffled[i].id,
        purpleContestantId: shuffled[i + 1].id,
      });
    }

    // Future round battles (empty slots, filled as winners advance)
    for (let round = 2; round <= totalRounds; round++) {
      const battlesInRound = contestants.length / Math.pow(2, round);
      for (let position = 1; position <= battlesInRound; position++) {
        battlesToCreate.push({ eventId, group, round, position });
      }
    }

    await this.prisma.battle.createMany({ data: battlesToCreate });

    return this.prisma.battle.findMany({
      where: { eventId, group },
      orderBy: [{ round: 'asc' }, { position: 'asc' }],
      include: { yellowContestant: true, purpleContestant: true },
    });
  }

  async getBracket(eventId: number, group: ContestantGroup) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    return this.prisma.battle.findMany({
      where: { eventId, group },
      orderBy: [{ round: 'asc' }, { position: 'asc' }],
      include: { yellowContestant: true, purpleContestant: true, winner: true },
    });
  }
}