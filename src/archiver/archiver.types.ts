import { Job, Queue } from 'bull';
import { Source } from '@app/tasks';

export type ArchiverJob = Job<{ source: Source }>;
export type ArchiverQueue = Queue<{ source: Source }>;
