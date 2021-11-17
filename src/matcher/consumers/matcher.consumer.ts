import { Process, Processor } from '@nestjs/bull';
import { MATCHER_QUEUE } from '../matcher.constants';
import { MatcherService } from '../services';
import { MatcherJob } from '../matcher.types';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';

@Processor(MATCHER_QUEUE)
export class MatcherConsumer extends LoggableProvider {
  constructor(
    private matcherService: MatcherService,
    @RootLogger() rootLogger: Bunyan,
  ) {
    super(rootLogger);
  }

  @Process({ concurrency: 5 })
  async match(job: MatcherJob) {

  }

  handleFailed(job: MatcherJob, error: Error) {

  }
}
