import {
  BeforeApplicationShutdown,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  CITE_NEWS_WATCHER_PARAMS,
  CITE_WEB_WATCHER_PARAMS,
} from '../mocks/watchers.mock';

@Injectable()
export class CrawlerService implements OnModuleInit, BeforeApplicationShutdown {
  private queues: Queue[];

  constructor(
    @InjectQueue('cite_web')
    private citeWebQueue: Queue,
    @InjectQueue('cite_news')
    private citeNewsQueue: Queue,
  ) {
    this.queues = [this.citeWebQueue, this.citeNewsQueue];
  }

  async beforeApplicationShutdown() {
    await this.citeWebQueue.close(true);
    await this.citeNewsQueue.close(true);
  }

  async onModuleInit() {
    await this.citeWebQueue.empty();
    await this.citeWebQueue.clean(0, 'completed');
    await this.citeWebQueue.clean(0, 'active');
    await this.citeWebQueue.clean(0, 'delayed');
    await this.citeWebQueue.clean(0, 'failed');
    await this.citeNewsQueue.empty();
    await this.citeNewsQueue.clean(0, 'completed');
    await this.citeNewsQueue.clean(0, 'active');
    await this.citeNewsQueue.clean(0, 'delayed');
    await this.citeNewsQueue.clean(0, 'failed');

    await this.citeWebQueue.add(CITE_WEB_WATCHER_PARAMS);
    await this.citeNewsQueue.add(CITE_NEWS_WATCHER_PARAMS);
  }
}