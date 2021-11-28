import { Module } from '@nestjs/common';
import { SharedModule } from '@core/shared';
import { MatcherModule } from './matcher.module';

@Module({
  imports: [MatcherModule, SharedModule],
})
export class ProcessorModule {}
