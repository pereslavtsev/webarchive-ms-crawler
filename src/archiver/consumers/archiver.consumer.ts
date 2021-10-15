import { Process, Processor } from '@nestjs/bull';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ARCHIVER_QUEUE } from '../archiver.constants';
import { ArchiverJob } from '../archiver.types';
import { MementoService } from '@app/memento/services';
import { CoreProvider } from '@app/core';
import { Memento } from '@app/tasks/models/memento.model';
import { Repository } from 'typeorm';
import { InjectSourcesRepository, Source } from '@app/tasks';
import { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { InjectArchiverQueue } from '@app/archiver';
import { AnalyzerQueue } from '@app/analyzer/analyzer.types';
import { InjectAnalyzerQueue } from '@app/analyzer/analyzer.decorators';

@Processor(ARCHIVER_QUEUE)
export class ArchiverConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private mementoService: MementoService,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<Source>,
    @InjectAnalyzerQueue()
    private analyzerQueue: AnalyzerQueue,
  ) {
    super(rootLogger);
  }

  @Process()
  async archive(job: ArchiverJob) {
    try {
      const {
        data: { source, task },
      } = job;
      const { url, revisionDate } = source;

      try {
        const {
          mementos: { closest },
        } = await this.mementoService.get(url, revisionDate);
        if (!closest) {
          console.log('error', '!!!');
        }
        source.mementos = closest.uri.map((uri) => {
          const memento = new Memento();
          memento.uri = uri;
          memento.archivedDate = new Date(closest.datetime);
          return memento;
        });
        const s = await this.sourcesRepository.save(source);
        await this.analyzerQueue.add({ source: s, task });
      } catch (error) {
        const errorResponse = error as AxiosError;
        switch (errorResponse.response.status) {
          case StatusCodes.TOO_MANY_REQUESTS: {
            this.log.error('too many requests');
            await job.retry();
          }
        }
      }
    } catch (error) {
      this.log.error(error);
    }
  }
}
