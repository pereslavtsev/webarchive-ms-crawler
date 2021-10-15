import { forwardRef, Module } from "@nestjs/common";
import { CrawlerService } from './services/crawler.service';
import { BullModule } from '@nestjs/bull';
import { CRAWLER_PROCESSOR } from './crawler.constants';
import * as consumers from './consumers';
import { TasksModule } from '../tasks';
import { MatcherModule } from '@app/matcher';

@Module({
  imports: [
    forwardRef(() => TasksModule),
    MatcherModule,
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
