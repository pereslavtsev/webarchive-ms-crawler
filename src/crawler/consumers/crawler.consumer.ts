import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiPage } from 'mwn';
import { Injectable } from '@nestjs/common';
import { TasksService } from '@app/tasks';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { InjectMatcherQueue, MatcherQueue } from '@app/matcher';
import { CoreProvider } from '@app/core';

@Injectable()
export abstract class CrawlerConsumer extends CoreProvider {
  constructor(
    private eventEmitter: EventEmitter2,
    private tasksService: TasksService,
    @RootLogger() rootLogger: Bunyan,
    @InjectMatcherQueue()
    private matcherQueue: MatcherQueue,
  ) {
    super(rootLogger);
  }

  @OnQueueProgress()
  async progress(job: Job, pages: ApiPage[]) {
    this.log.info('received pages:', ...pages.map((p) => p.title));
    const tasks = await this.tasksService.create(...pages);
    await this.matcherQueue.addBulk(
      tasks.filter((task) => !task.skipped).map((task) => ({ data: { task } })),
    );

    // pages.forEach((page) =>
    //   this.eventEmitter.emit('page.received', {
    //     data: page,
    //   } as PageReceivedEvent),
    // );
  }
}
