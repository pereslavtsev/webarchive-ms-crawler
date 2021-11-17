import { Job, Queue } from 'bull';
import { Task } from '@core/tasks';

export type MatcherJob = Job<{ task: Task }>;
export type MatcherQueue = Queue<{ task: Task }>;
