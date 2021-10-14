import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiPage } from 'mwn';
import { Injectable } from '@nestjs/common';
import { TasksService } from '@app/tasks';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class CrawlerConsumer {
  private readonly log: Bunyan;

  constructor(
    private eventEmitter: EventEmitter2,
    private tasksService: TasksService,
    @RootLogger() rootLogger: Bunyan,
  ) {
    this.log = rootLogger.child({ component: this.constructor.name });
  }

  @OnQueueProgress()
  async progress(job: Job, pages: ApiPage[]) {
    this.log.info('received pages:', ...pages.map((p) => p.title));
    await this.tasksService.create(...pages);

    // pages.forEach((page) =>
    //   this.eventEmitter.emit('page.received', {
    //     data: page,
    //   } as PageReceivedEvent),
    // );
  }
}
