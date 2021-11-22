import {
  OnQueueFailed,
  OnQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { MATCHER_QUEUE } from '../matcher.constants';
import { MatcherService } from '../services';
import { MatcherJob } from '../matcher.types';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { TasksService } from '@core/tasks';

@Processor(MATCHER_QUEUE)
export class MatcherConsumer extends LoggableProvider {
  constructor(
    private matcherService: MatcherService,
    private tasksService: TasksService,
    @RootLogger() rootLogger: Bunyan,
  ) {
    super(rootLogger);
  }

  @Process({ concurrency: 5 })
  async match(job: MatcherJob) {
    const log = this.log.child({ reqId: job.id });

    const {
      data: { task },
    } = job;

    log.debug('matching...');

    await this.matcherService.match(task);
    await this.tasksService.setMatched(task.id);
  }

  @OnQueueProgress()
  handleProgress(job: MatcherJob, progress: number) {
    const log = this.log.child({ reqId: job.id });
    log.debug(`task matching progress: ${progress}%`);
  }

  @OnQueueFailed()
  handleFailed(job: MatcherJob, error: Error) {
    const log = this.log.child({ reqId: job.id });
    log.error(error);
  }
}
