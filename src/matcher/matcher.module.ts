import {
  BeforeApplicationShutdown,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MatcherQueue } from './matcher.types';
import { InjectMatcherQueue } from './matcher.decorators';
import { MatcherService, MatcherQueueConfigService } from './services';
import { MatcherConsumer } from './consumers';
import { MATCHER_QUEUE } from "@app/matcher/matcher.constants";

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: MATCHER_QUEUE,
    }),
  ],
  providers: [MatcherConsumer, MatcherService],
  exports: [MatcherService],
})
export class MatcherModule {
  // constructor(
  //   @InjectMatcherQueue()
  //   private matcherQueue: MatcherQueue,
  // ) {}
  //
  // async beforeApplicationShutdown() {
  //   await this.matcherQueue.clean(0, 'completed');
  //   await this.matcherQueue.clean(0, 'active');
  //   await this.matcherQueue.clean(0, 'delayed');
  //   await this.matcherQueue.clean(0, 'failed');
  //   await this.matcherQueue.close(true);
  //   await this.matcherQueue.close(true);
  // }
  //
  // async onModuleInit() {
  //   await this.matcherQueue.pause();
  //   await this.matcherQueue.empty();
  //   await this.matcherQueue.clean(0, 'completed');
  //   await this.matcherQueue.clean(0, 'active');
  //   await this.matcherQueue.clean(0, 'delayed');
  //   await this.matcherQueue.clean(0, 'failed');
  // }
}
