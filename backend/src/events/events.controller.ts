import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Query, Patch } from '@nestjs/common';
import { ContestantGroup } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AddContestantsDto } from './dto/add-contestants.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with contestant and battle counts' })
  @ApiResponse({ status: 200, description: 'Returns a list of events' })
  getEvents() {
    return this.eventsService.getEvents()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID including contestants and battles' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEvent(id);
  }

  @Post(':id/contestants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add contestants to an event for a given group' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 201, description: 'Contestants added' })
  @ApiResponse({ status: 400, description: 'Contestants for this group already added' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addContestants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddContestantsDto,
  ) {
    return this.eventsService.addContestants(id, dto);
  }

  @Patch('contestants/:contestantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a contestant\'s name' })
  @ApiParam({ name: 'contestantId', type: Number })
  @ApiResponse({ status: 200, description: 'Contestant updated' })
  @ApiResponse({ status: 404, description: 'Contestant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateContestant(
    @Param('contestantId', ParseIntPipe) contestantId: number,
    @Body() dto: { name: string },
  ) {
    return this.eventsService.updateContestant(contestantId, dto);
  }

  @Post(':id/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Randomly generate the bracket for a group' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'group', enum: ContestantGroup })
  @ApiResponse({ status: 201, description: 'Bracket generated and returned' })
  @ApiResponse({ status: 400, description: 'Bracket already generated or invalid contestant count' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generateBracket(
    @Param('id', ParseIntPipe) id: number,
    @Query('group') group: ContestantGroup,
  ) {
    return this.eventsService.generateBracket(id, group);
  }

  @Post(':id/reshuffle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reshuffle the bracket for a group (only allowed if no battles have been played)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'group', enum: ContestantGroup })
  @ApiResponse({ status: 200, description: 'Bracket reshuffled and returned' })
  @ApiResponse({ status: 400, description: 'Cannot reshuffle after battles have been played' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  reshuffleBracket(
    @Param('id', ParseIntPipe) id: number,
    @Query('group') group: ContestantGroup,
  ) {
    return this.eventsService.reshuffleBracket(id, group);
  }

  @Get(':id/bracket')
  @ApiOperation({ summary: 'Get the full bracket for a group' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'group', enum: ContestantGroup })
  @ApiResponse({ status: 200, description: 'Returns all battles ordered by round and position' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getBracket(
    @Param('id', ParseIntPipe) id: number,
    @Query('group') group: ContestantGroup,
  ) {
    return this.eventsService.getBracket(id, group);
  }
}