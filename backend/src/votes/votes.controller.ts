import { Controller, Post, Body } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @ApiOperation({ summary: 'Cast a vote for a battle' })
  @ApiResponse({ status: 201, description: 'Vote cast successfully' })
  @ApiResponse({ status: 400, description: 'Voting is not open for this battle' })
  @ApiResponse({ status: 409, description: 'You have already voted in this battle' })
  castVote(@Body() dto: CastVoteDto) {
    return this.votesService.castVote(dto);
  }
}