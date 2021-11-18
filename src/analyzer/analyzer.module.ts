import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ANALYZER_QUEUE } from './analyzer.constants';
import { AnalyzerConsumer } from './consumers';
import { AnalyzerService } from './services';
import { TemplatesModule } from '@core/templates';
import { TasksModule } from '@core/tasks';
import { AnalyzerListener } from './listeners';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ANALYZER_QUEUE,
    }),
    TemplatesModule,
    TasksModule,
  ],
  providers: [AnalyzerConsumer, AnalyzerListener, AnalyzerService],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
