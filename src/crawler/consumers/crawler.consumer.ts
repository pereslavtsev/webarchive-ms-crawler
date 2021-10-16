import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress } from '@nestjs/bull';
import type { Job } from 'bull';
import type { ApiPage } from 'mwn';
import { Injectable } from '@nestjs/common';
import { TasksService } from '@app/tasks';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { MatcherService } from '@app/matcher';
import { CoreProvider } from '@app/core';

@Injectable()
export abstract class CrawlerConsumer extends CoreProvider {
  constructor(
    private eventEmitter: EventEmitter2,
    private tasksService: TasksService,
    @RootLogger() rootLogger: Bunyan,
    private matcherService: MatcherService,
  ) {
    super(rootLogger);
  }

  @OnQueueProgress()
  async progress(job: Job, pages: ApiPage[]) {
    const log = this.log.child({ reqId: job.id });
    log.info('received pages:', ...pages.map((p) => p.title));
    const tasks = await this.tasksService.create(...pages);
    await this.matcherService.submit(...tasks);
  }
}
