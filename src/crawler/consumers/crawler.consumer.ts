import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiPage } from 'mwn';
import { Injectable } from '@nestjs/common';

import { PageReceivedEvent } from '../../core';

@Injectable()
export class CrawlerConsumer {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnQueueProgress()
  progress(job: Job, pages: ApiPage[]) {
    pages.forEach((page) =>
      this.eventEmitter.emit('page.received', {
        data: page,
      } as PageReceivedEvent),
    );
  }
}
