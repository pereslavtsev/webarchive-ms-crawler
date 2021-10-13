import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

import { PageListener } from './listeners/page.listener';
import { ANALYZER_QUEUE } from './analyzer.constants';

@Module({
  imports: [
    // BullModule.registerQueue({
    //   name: ANALYZER_QUEUE,
    //   processors: [join(__dirname, 'processors', 'analyzer.processor.js')],
    // }),
  ],
  //providers: [PageListener],
})
export class AnalyzerModule {}
