import { InjectQueue } from '@nestjs/bull';
import { ANALYZER_QUEUE } from './analyzer.constants';

export function InjectAnalyzerQueue() {
  return InjectQueue(ANALYZER_QUEUE);
}
