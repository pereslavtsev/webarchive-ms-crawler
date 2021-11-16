// import {
//   BeforeApplicationShutdown,
//   Module,
//   OnModuleInit,
// } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';
// import { ANALYZER_QUEUE } from './analyzer.constants';
// import { HttpModule } from '@nestjs/axios';
// import { AnalyzerConsumer } from './consumers';
// import { AnalyzerService } from './services';
// import { InjectAnalyzerQueue } from './analyzer.decorators';
// import { AnalyzerQueue } from './analyzer.types';
//
// @Module({
//   imports: [
//     HttpModule.register({
//       timeout: 60 * 1000,
//       maxRedirects: 5,
//     }),
//     BullModule.registerQueue({
//       name: ANALYZER_QUEUE,
//     }),
//   ],
//   providers: [AnalyzerConsumer, AnalyzerService],
//   exports: [AnalyzerService],
// })
// export class AnalyzerModule implements OnModuleInit, BeforeApplicationShutdown {
//   constructor(
//     @InjectAnalyzerQueue()
//     private analyzerQueue: AnalyzerQueue,
//   ) {}
//
//   async beforeApplicationShutdown() {
//     await this.analyzerQueue.clean(0, 'completed');
//     await this.analyzerQueue.clean(0, 'active');
//     await this.analyzerQueue.clean(0, 'delayed');
//     await this.analyzerQueue.clean(0, 'failed');
//     await this.analyzerQueue.close(true);
//     await this.analyzerQueue.close(true);
//   }
//
//   async onModuleInit() {
//     await this.analyzerQueue.pause();
//     await this.analyzerQueue.empty();
//     await this.analyzerQueue.clean(0, 'completed');
//     await this.analyzerQueue.clean(0, 'active');
//     await this.analyzerQueue.clean(0, 'delayed');
//     await this.analyzerQueue.clean(0, 'failed');
//   }
// }
