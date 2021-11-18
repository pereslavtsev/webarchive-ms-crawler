import { Injectable } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnTask, Task } from '@core/tasks';
import { InjectMatcherQueue } from '../matcher.decorators';
import type { MatcherQueue } from '../matcher.types';

@Injectable()
export class MatcherListener extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectMatcherQueue()
    private matcherQueue: MatcherQueue,
  ) {
    super(rootLogger);
  }

  @OnTask.Accepted()
  protected async handleTaskAcceptedEvent(task: Task) {
    await this.matcherQueue.add({ task }, { jobId: task.id });
  }
}
