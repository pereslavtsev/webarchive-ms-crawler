import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ANALYZER_QUEUE } from './analyzer.constants';
import { HttpModule } from '@nestjs/axios';
import { AnalyzerConsumer } from './consumers';
import { TasksModule } from '@app/tasks';

@Module({
  imports: [
    TasksModule,
    HttpModule.register({
      timeout: 60 * 1000,
      maxRedirects: 5,
    }),
    BullModule.registerQueue({
      name: ANALYZER_QUEUE,
    }),
  ],
  providers: [AnalyzerConsumer],
  //providers: [PageListener],
  exports: [BullModule],
})
export class AnalyzerModule {}
