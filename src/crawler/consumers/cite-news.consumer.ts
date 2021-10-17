import { OnQueueDrained, Processor } from '@nestjs/bull';
import { CrawlerConsumer } from './crawler.consumer';

@Processor('cite_news')
export class CiteNewsConsumer extends CrawlerConsumer {
  @OnQueueDrained()
  handleDrained() {
    this.log.info(`"cite_news" queue has been drained`);
  }
}
