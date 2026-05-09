import { IsInt, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { VoteChoice } from '@prisma/client';

export class CastVoteDto {
  @IsInt()
  battleId: number;

  @IsString()
  @IsNotEmpty()
  userId: string; // anonymous token from localStorage

  @IsEnum(VoteChoice)
  votedFor: VoteChoice;
}