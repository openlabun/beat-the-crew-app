import { Controller, Post, Body } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  // Public — no JWT guard, anyone with the vote page can submit
  @Post()
  castVote(@Body() dto: CastVoteDto) {
    return this.votesService.castVote(dto);
  }
}