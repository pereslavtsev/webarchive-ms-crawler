import { Injectable } from '@nestjs/common';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { OnEvent } from '@nestjs/event-emitter';
import { ApiPage } from 'mwn';
import { TasksService } from '../services';
import { MatcherService } from '@app/matcher';

@Injectable()
export class PageListener extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private tasksService: TasksService,
    private matcherService: MatcherService,
  ) {
    super(rootLogger);
  }

  @OnEvent('page.received')
  async handlePagesReceivedEvent(...pages: ApiPage[]) {
    const tasks = await this.tasksService.create(...pages);
    await this.matcherService.submit(...tasks);
  }
}
