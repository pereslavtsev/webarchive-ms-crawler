import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import {
  Process,
  Processor,
  OnQueueActive,
  OnQueueFailed,
  OnQueueCompleted,
} from '@nestjs/bull';
import { ANALYZER_QUEUE } from '../analyzer.constants';
import type { AnalyzerJob } from '../analyzer.types';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Task, TasksService } from '@core/tasks';
import { AnalyzerService } from '../services';

@Processor(ANALYZER_QUEUE)
export class AnalyzerConsumer extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private tasksService: TasksService,
    private analyzerService: AnalyzerService,
  ) {
    super(rootLogger);
  }

  @Process({ concurrency: 10 })
  async analyze(job: AnalyzerJob) {
    const {
      data: { task },
    } = job;
    return this.analyzerService.analyze(task);
  }

  @OnQueueActive()
  handleStarted(job: AnalyzerJob) {
    const log = this.log.child({ reqId: job.id });
    log.debug('analyzing page...');
  }

  @OnQueueCompleted()
  async handleCompleted(job: AnalyzerJob, task: Task) {
    const log = this.log.child({ reqId: job.id });
    log.debug('sources added', task.sources?.length || 0);
    if (task.sources?.length) {
      await this.tasksService.setAccepted(task.id);
    }
  }

  @OnQueueFailed()
  async handleFailed(job: AnalyzerJob, error: Error) {
    const log = this.log.child({ reqId: job.id });
    log.error(error);

    try {
      const {
        data: { task },
      } = job;
      await this.tasksService.setFailed(task.id);
    } catch (error) {
      log.error(error);
    }
  }
}
