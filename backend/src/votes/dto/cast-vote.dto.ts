import { IsInt, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { VoteChoice } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  battleId: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Anonymous token from localStorage' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: VoteChoice, example: VoteChoice.YELLOW })
  @IsEnum(VoteChoice)
  votedFor: VoteChoice;
}