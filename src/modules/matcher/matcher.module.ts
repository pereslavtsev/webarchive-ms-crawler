import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MatcherService } from './services';
import { MatcherConsumer } from './consumers';
import { MATCHER_QUEUE } from './matcher.constants';
import { SourcesModule } from '@core/sources';
import { TasksModule } from '@core/tasks';
import { MatcherListener } from './listeners';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: MATCHER_QUEUE,
    }),
    SourcesModule,
    TasksModule,
  ],
  providers: [MatcherConsumer, MatcherListener, MatcherService],
  exports: [MatcherService],
})
export class MatcherModule {}
