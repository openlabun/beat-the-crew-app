import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  // Public — vote page and screen need to know which battle is active
  @Get('active')
  getActiveBattle(@Query('eventId', ParseIntPipe) eventId: number) {
    return this.battlesService.getActiveBattle(eventId);
  }

  @Get(':id')
  getBattle(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.getBattle(id);
  }

  // Admin only from here down
  @Patch(':id/open')
  @UseGuards(JwtAuthGuard)
  openVoting(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.openVoting(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  closeVoting(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.closeVoting(id);
  }

  @Patch(':id/announce')
  @UseGuards(JwtAuthGuard)
  announce(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.announce(id);
  }

  @Patch(':id/rerun')
  @UseGuards(JwtAuthGuard)
  rerun(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.rerun(id);
  }

  @Get(':id/tally')
  @UseGuards(JwtAuthGuard)
  getLiveTally(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.getLiveTally(id);
  }
}