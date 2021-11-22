import { Injectable } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnTask, Task } from '@core/tasks';
import { InjectAnalyzerQueue } from '../analyzer.decorators';
import type { AnalyzerQueue } from '../analyzer.types';

@Injectable()
export class AnalyzerListener extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectAnalyzerQueue()
    private analyzerQueue: AnalyzerQueue,
  ) {
    super(rootLogger);
  }

  @OnTask.Created()
  async handleTaskCreatedEvent(task: Task) {
    await this.analyzerQueue.add({ task }, { jobId: task.id });
  }

  @OnTask.Skipped()
  @OnTask.Cancelled()
  async handleTaskSkippedOrCancelledEvent(task: Task) {
    const job = await this.analyzerQueue.getJob(task.id);
    if (job) {
      await job.discard();
    }
  }
}
