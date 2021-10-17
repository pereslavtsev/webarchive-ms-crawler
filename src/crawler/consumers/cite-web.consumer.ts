import { OnQueueDrained, Processor } from '@nestjs/bull';
import { CrawlerConsumer } from './crawler.consumer';

@Processor('cite_web')
export class CiteWebConsumer extends CrawlerConsumer {
  @OnQueueDrained()
  handleDrained() {
    this.log.info(`"cite_web" queue has been drained`);
  }
}
