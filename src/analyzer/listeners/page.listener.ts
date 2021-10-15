import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PageReceivedEvent } from '../../core';
import { InjectAnalyzerQueue } from '../analyzer.decorators';
import { AnalyzerQueue } from '../analyzer.types';

@Injectable()
export class PageListener {
  constructor(
    @InjectAnalyzerQueue()
    private analyzerQueue: AnalyzerQueue,
  ) {}

  @OnEvent('page.received')
  async handlePageReceivedEvent(event: PageReceivedEvent) {
    //console.log('event2', event);
  }
}
