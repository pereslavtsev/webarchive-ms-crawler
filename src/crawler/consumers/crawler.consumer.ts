import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress, OnQueueDrained } from '@nestjs/bull';
import type { Job } from 'bull';
import type { ApiPage } from 'mwn';
import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { CoreProvider } from '@app/core';

@Injectable()
export abstract class CrawlerConsumer extends CoreProvider {
  constructor(
    private eventEmitter: EventEmitter2,
    @RootLogger() rootLogger: Bunyan,
  ) {
    super(rootLogger);
  }

  @OnQueueProgress()
  async progress(job: Job, pages: ApiPage[]) {
    const log = this.log.child({ reqId: job.id });
    log.info('received pages:', ...pages.map((p) => p.title));
    this.eventEmitter.emit('page.received', ...pages);
  }
}
