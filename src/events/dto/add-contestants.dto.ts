import { IsArray, IsEnum, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ContestantGroup } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AddContestantsDto {
  @ApiProperty({
    example: ['Alex', 'Jordan', 'Sam', 'Taylor'],
    minItems: 2,
    maxItems: 16,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(16)
  names: string[];

  @ApiProperty({ enum: ContestantGroup, example: ContestantGroup.CREW })
  @IsEnum(ContestantGroup)
  group: ContestantGroup;
}