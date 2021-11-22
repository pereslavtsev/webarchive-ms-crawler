import { InjectQueue } from '@nestjs/bull';
import { MATCHER_QUEUE } from './matcher.constants';

export function InjectMatcherQueue() {
  return InjectQueue(MATCHER_QUEUE);
}
