import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ContestantGroup } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AddContestantsDto } from './dto/add-contestants.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
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

  @Post(':id/generate')
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