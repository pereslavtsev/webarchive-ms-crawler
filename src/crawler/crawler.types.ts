import { Job } from 'bull';
import { ApiParams } from 'mwn';

export type CrawlerJob = Job<ApiParams>;
