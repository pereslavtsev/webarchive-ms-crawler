import { InjectQueue } from '@nestjs/bull';
import { ARCHIVER_QUEUE } from './archiver.constants';

export function InjectArchiverQueue() {
  return InjectQueue(ARCHIVER_QUEUE);
}
