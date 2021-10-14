import { Process, Processor } from '@nestjs/bull';
import { MATCHER_QUEUE } from '../matcher.constants';
import { MatcherService } from '../services';
import { MatcherJob } from '../matcher.types';
import { InjectSourcesRepository, Source } from '@app/tasks';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Repository } from 'typeorm';

@Processor(MATCHER_QUEUE)
export class MatcherConsumer {
  private readonly log: Bunyan;

  constructor(
    private matcherService: MatcherService,
    @RootLogger() rootLogger: Bunyan,
  ) {
    this.log = rootLogger.child({ component: this.constructor.name });
  }

  @Process({ concurrency: 5 })
  async match(job: MatcherJob) {
    try {
      const {
        data: { task },
      } = job;
      await this.matcherService.matchSources(task);
    } catch (error) {
      this.log.error('error', error);
    }
  }
}
