import { Job, Queue } from 'bull';
import type { Source, Task } from '@app/tasks';

export type ArchiverJob = Job<{ source: Source; task: Task }>;
export type ArchiverQueue = Queue<{ source: Source; task: Task }>;
