import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MatcherService } from './services';
import { MatcherConsumer } from './consumers';
import { MATCHER_QUEUE } from './matcher.constants';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: MATCHER_QUEUE,
    }),
  ],
  providers: [MatcherConsumer, MatcherService],
  exports: [MatcherService],
})
export class MatcherModule {}
