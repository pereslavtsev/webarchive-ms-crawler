import { InjectQueue } from '@nestjs/bull';
import { WRITER_QUEUE } from './writer.constants';

export function InjectWriterQueue() {
  return InjectQueue(WRITER_QUEUE);
}
