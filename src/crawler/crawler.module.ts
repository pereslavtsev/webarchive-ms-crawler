import { Module } from '@nestjs/common';
import { CrawlerService } from './services/crawler.service';
import { BullModule } from '@nestjs/bull';
import { CRAWLER_PROCESSOR } from './crawler.constants';
import * as consumers from './consumers';
import { TasksModule } from '../tasks';
import { CiteTemplatesModule } from '../cite-templates';

@Module({
  imports: [
    TasksModule,
    CiteTemplatesModule,
    BullModule.registerQueue(
      {
        name: 'cite_web',
        processors: [CRAWLER_PROCESSOR],
      },
      {
        name: 'cite_news',
        processors: [CRAWLER_PROCESSOR],
      },
    ),
  ],
  providers: [...Object.values(consumers), CrawlerService],
})
export class CrawlerModule {}
