import { Process, Processor } from '@nestjs/bull';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ARCHIVER_QUEUE } from '../archiver.constants';
import { ArchiverJob } from '../archiver.types';
import { MementoService } from '@app/memento/services';
import { CoreProvider } from '@app/core';
import { Memento } from '@app/tasks/models/memento.model';
import type { SourceArchivedEvent } from '@app/tasks';
import type { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(ARCHIVER_QUEUE)
export class ArchiverConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private mementoService: MementoService,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  @Process()
  async archive(job: ArchiverJob) {
    const log = this.log.child({ reqId: job.id });
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
          log.error('no closest mementos was found');
          await job.moveToFailed({
            message: 'no closest mementos was found',
          });
          return;
        }

        source.mementos = closest.uri.map((uri) => {
          const memento = new Memento();
          memento.uri = uri;
          memento.archivedDate = new Date(closest.datetime);
          return memento;
        });
        log.info(
          { url: closest.uri },
          `${closest.uri.length} closest mementos was found for url, moving to archived...`,
        );

        this.eventEmitter.emit('source.archived', {
          source,
          task,
        } as SourceArchivedEvent);
      } catch (error) {
        const errorResponse = error as AxiosError;
        switch (errorResponse.response.status) {
          case StatusCodes.TOO_MANY_REQUESTS: {
            log.error('too many requests');
            await job.queue.add(job.data);
            break;
          }
          default: {
            log.error(error);
            this.eventEmitter.emit('source.failed', {
              source,
              task,
            });
          }
        }
      }
    } catch (error) {
      log.error(error);
    }
  }
}
