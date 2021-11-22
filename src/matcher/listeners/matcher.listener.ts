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
  async handleTaskAcceptedEvent(task: Task): Promise<void> {
    await this.matcherQueue.add({ task }, { jobId: task.id });
  }

  @OnTask.Cancelled()
  async handleTaskCancelledEvent(task: Task): Promise<void> {
    const job = await this.matcherQueue.getJob(task.id);
    if (job) {
      await job.discard();
    }
  }
}
