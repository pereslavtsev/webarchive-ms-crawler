import { Processor } from '@nestjs/bull';
import { CrawlerConsumer } from './crawler.consumer';

@Processor('cite_news')
export class CiteNewsConsumer extends CrawlerConsumer {}
