import { Controller, Post, Get, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ContestantGroup } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AddContestantsDto } from './dto/add-contestants.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Get(':id')
  getEvent(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEvent(id);
  }

  @Post(':id/contestants')
  addContestants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddContestantsDto,
  ) {
    return this.eventsService.addContestants(id, dto);
  }

  @Post(':id/generate')
  generateBracket(
    @Param('id', ParseIntPipe) id: number,
    @Query('group') group: ContestantGroup,
  ) {
    return this.eventsService.generateBracket(id, group);
  }

  @Get(':id/bracket')
  getBracket(
    @Param('id', ParseIntPipe) id: number,
    @Query('group') group: ContestantGroup,
  ) {
    return this.eventsService.getBracket(id, group);
  }
}