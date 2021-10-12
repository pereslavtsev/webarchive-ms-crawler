import { Job } from 'bull';
import { ApiParams } from 'mwn';

export type WatcherJob = Job<ApiParams>;
