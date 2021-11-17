import type { Job, Queue } from 'bull';
import type { Task } from '@core/tasks';

export type AnalyzerJob = Job<{ task: Task }>;
export type AnalyzerQueue = Queue<{ task: Task }>;
