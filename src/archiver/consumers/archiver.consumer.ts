import { Process, Processor } from '@nestjs/bull';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ARCHIVER_QUEUE } from '../archiver.constants';
import { ArchiverJob } from '../archiver.types';
import { MementoService } from '@app/memento/services';

@Processor(ARCHIVER_QUEUE)
export class ArchiverConsumer {
  private readonly log: Bunyan;

  constructor(
    @RootLogger() rootLogger: Bunyan,
    private mementoService: MementoService,
  ) {
    this.log = rootLogger.child({ component: this.constructor.name });
  }

  @Process({ concurrency: 5 })
  async archive(job: ArchiverJob) {
    try {
      console.log('run');
      const {
        data: {
          source: { url, revisionDate },
        },
      } = job;
      const { mementos } = await this.mementoService.get(url, revisionDate);
      console.log('mementos', mementos);
    } catch (error) {
      this.log.error(error);
    }
  }
}
