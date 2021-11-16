// import { Process, Processor } from '@nestjs/bull';
// import { MATCHER_QUEUE } from '../matcher.constants';
// import { MatcherService } from '../services';
// import { MatcherJob } from '../matcher.types';
// import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
// import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
//
// @Processor(MATCHER_QUEUE)
// export class MatcherConsumer extends LoggableProvider {
//   constructor(
//     private matcherService: MatcherService,
//     @RootLogger() rootLogger: Bunyan,
//   ) {
//     super(rootLogger);
//   }
//
//   @Process({ concurrency: 5 })
//   async match(job: MatcherJob) {
//     try {
//       const {
//         data: { task },
//       } = job;
//       await this.matcherService.matchSources(task);
//     } catch (error) {
//       this.handleError(job, error);
//     }
//   }
//
//   protected handleError(job: MatcherJob, error: Error) {
//     const log = this.log.child({ reqId: job.id });
//     log.error('error', error);
//   }
// }
