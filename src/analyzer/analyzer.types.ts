import { Job, Queue } from 'bull';
import { PageReceivedEvent } from '../core';

export type AnalyzerJob = Job<{ page: PageReceivedEvent['data'] }>;
export type AnalyzerQueue = Queue<{ page: PageReceivedEvent['data'] }>;
