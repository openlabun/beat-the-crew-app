import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('battles')
@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active battle for an event' })
  @ApiQuery({ name: 'eventId', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the active battle or null' })
  getActiveBattle(@Query('eventId', ParseIntPipe) eventId: number) {
    return this.battlesService.getActiveBattle(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a battle by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the battle' })
  @ApiResponse({ status: 404, description: 'Battle not found' })
  getBattle(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.getBattle(id);
  }

  @Patch(':id/open')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Open voting for a battle' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Voting opened, emits voting:opened to all clients' })
  @ApiResponse({ status: 400, description: 'Battle not ready or voting already open' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  openVoting(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.openVoting(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Close voting and silently determine winner or tie' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Voting closed, result stored but not announced yet' })
  @ApiResponse({ status: 400, description: 'Voting is not open' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  closeVoting(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.closeVoting(id);
  }

  @Patch(':id/announce')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Announce the result — emits battle:winner or battle:tie to all clients' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Result announced' })
  @ApiResponse({ status: 400, description: 'Voting is still open' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  announce(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.announce(id);
  }

  @Patch(':id/rerun')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reset a tied battle for a rerun — emits battle:rerun to all clients' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Battle reset, ready to be reopened' })
  @ApiResponse({ status: 400, description: 'Battle already has a winner or voting is still open' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  rerun(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.rerun(id);
  }

  @Get(':id/tally')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get live vote tally for a battle (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Returns current yellow and purple vote counts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLiveTally(@Param('id', ParseIntPipe) id: number) {
    return this.battlesService.getLiveTally(id);
  }
}