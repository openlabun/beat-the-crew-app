import { IsArray, IsEnum, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ContestantGroup } from '@prisma/client';

export class AddContestantsDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(16)
  names: string[];

  @IsEnum(ContestantGroup)
  group: ContestantGroup;
}