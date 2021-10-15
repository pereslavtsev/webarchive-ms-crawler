import { Process, Processor } from '@nestjs/bull';
import { MATCHER_QUEUE } from '../matcher.constants';
import { MatcherService } from '../services';
import { MatcherJob } from '../matcher.types';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { CoreProvider } from '@app/core';

@Processor(MATCHER_QUEUE)
export class MatcherConsumer extends CoreProvider {
  constructor(
    private matcherService: MatcherService,
    @RootLogger() rootLogger: Bunyan,
  ) {
    super(rootLogger);
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
