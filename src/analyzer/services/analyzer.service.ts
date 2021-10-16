import { Injectable } from '@nestjs/common';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import type { Task, Source } from '@app/tasks';
import { InjectAnalyzerQueue } from '../analyzer.decorators';
import type { AnalyzerQueue } from '../analyzer.types';

@Injectable()
export class AnalyzerService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectAnalyzerQueue()
    private analyzerQueue: AnalyzerQueue,
  ) {
    super(rootLogger);
  }

  async submit(task: Task, source: Source) {
    await this.analyzerQueue.add(
      { source, task },
      { jobId: `source_${source.id}` },
    );
  }
}
