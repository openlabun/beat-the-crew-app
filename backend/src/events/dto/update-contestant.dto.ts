import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContestantDto {
  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty()
  name: string;
}