import { Module } from '@nestjs/common';
import { ScreenGateway } from './screen.gateway';

@Module({
  providers: [ScreenGateway],
  exports: [ScreenGateway],
})
export class ScreenModule {}