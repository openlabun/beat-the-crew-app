import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Beat the Crew 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;
}