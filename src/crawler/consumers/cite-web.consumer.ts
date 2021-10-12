import { Processor } from '@nestjs/bull';
import { CrawlerConsumer } from './crawler.consumer';

@Processor('cite_web')
export class CiteWebConsumer extends CrawlerConsumer {}
