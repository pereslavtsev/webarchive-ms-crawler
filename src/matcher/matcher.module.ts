import {
  BeforeApplicationShutdown,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MATCHER_QUEUE } from './matcher.constants';
import { MatcherQueue } from './matcher.types';
import { InjectMatcherQueue } from './matcher.decorators';
import { MatcherService } from './services';
import { MatcherConsumer } from './consumers';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MATCHER_QUEUE,
    }),
  ],
  providers: [MatcherConsumer, MatcherService],
  exports: [BullModule, MatcherService],
})
export class MatcherModule implements OnModuleInit, BeforeApplicationShutdown {
  constructor(
    @InjectMatcherQueue()
    private matcherQueue: MatcherQueue,
  ) {}

  async beforeApplicationShutdown() {
    await this.matcherQueue.clean(0, 'completed');
    await this.matcherQueue.clean(0, 'active');
    await this.matcherQueue.clean(0, 'delayed');
    await this.matcherQueue.clean(0, 'failed');
    await this.matcherQueue.close(true);
    await this.matcherQueue.close(true);
  }

  async onModuleInit() {
    await this.matcherQueue.pause();
    await this.matcherQueue.empty();
    await this.matcherQueue.clean(0, 'completed');
    await this.matcherQueue.clean(0, 'active');
    await this.matcherQueue.clean(0, 'delayed');
    await this.matcherQueue.clean(0, 'failed');
  }
}
