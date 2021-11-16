// import { CoreProvider } from '@app/core';
// import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { Process, Processor, OnQueueActive } from '@nestjs/bull';
// import { HttpService } from '@nestjs/axios';
//
// import { ANALYZER_QUEUE } from '../analyzer.constants';
// import type { AnalyzerJob } from '../analyzer.types';
//
// @Processor(ANALYZER_QUEUE)
// export class AnalyzerConsumer extends CoreProvider {
//   constructor(
//     @RootLogger() rootLogger: Bunyan,
//     private httpService: HttpService,
//     private eventEmitter: EventEmitter2,
//   ) {
//     super(rootLogger);
//     this.httpService.axiosRef.interceptors.request.use((config) => {
//       config.headers['User-Agent'] = new UserAgent();
//       return config;
//     });
//   }
//
//   async check(title: string, memento: Memento): Promise<boolean> {
//     const { data } = await this.httpService.axiosRef.get<string>(memento.uri);
//     const res = data.match(new RegExp(title, 'ig'));
//     if (!res) {
//       // this.log.error('Finding "' + title + '" in ' + memento.uri);
//       // console.log('res', res, new RegExp(title, 'ig'));
//       // console.log(data);
//     }
//     return !!res;
//   }
//
//   @Process({ concurrency: 5 })
//   async analyze(job: AnalyzerJob) {
//     const log = this.log.child({ reqId: job.id });
//     try {
//       const { source, task } = job.data;
//       const { mementos, url } = source;
//
//       for (const memento of mementos) {
//         try {
//           const checked = await this.check(task.pageTitle, memento);
//           if (checked) {
//             memento.checked = true;
//             log.debug(
//               { url: memento.uri },
//               `memento has been checked, moving to write page "${task.pageTitle}" ...`,
//             );
//             this.eventEmitter.emit('source.checked', { source, task });
//             return;
//           }
//         } catch (error) {
//           const errorResponse = error as AxiosError;
//           log.error(errorResponse, 'error');
//         }
//       }
//
//       log.warn(
//         {
//           url,
//           query: source.title.toLowerCase(),
//           mementos: mementos.map((memento) => memento.uri),
//         },
//         'all source mementos was analyzed, but no query match found for the source url',
//       );
//       this.eventEmitter.emit('source.unverifiable', { source, task });
//     } catch (error) {
//       log.error(error);
//     }
//   }
//
//   @OnQueueActive()
//   handleStarted(job: AnalyzerJob) {
//     const log = this.log.child({ reqId: job.id });
//     const { source } = job.data;
//     const { mementos, url } = source;
//     log.debug(
//       { url },
//       `checking ${mementos.length} mementos for the source url...`,
//     );
//   }
// }
