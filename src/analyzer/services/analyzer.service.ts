import { Injectable } from '@nestjs/common';
// import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { InjectAnalyzerQueue } from '../analyzer.decorators';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { ApiPage, ApiRevision, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { TemplatesService } from '@core/templates';
import { AnalyzerQueue } from '../analyzer.types';
import { Task, OnTask } from '@core/tasks';
// import type { AnalyzerQueue } from '../analyzer.types';

@Injectable()
export class AnalyzerService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private templatesService: TemplatesService,
    @InjectBot() private readonly bot: mwn,
    @InjectAnalyzerQueue()
    private analyzerQueue: AnalyzerQueue,
  ) {
    super(rootLogger);
  }

  @OnTask.Created()
  async handleTaskCreatedEvent(task: Task) {
    await this.analyzerQueue.add({ task }, { jobId: task.id });
  }

  async analyze(revision: ApiRevision) {

  }

  // async submit(task: Task, source: Source) {
  //   await this.analyzerQueue.add(
  //     { source, task },
  //     { jobId: `source_${source.id}` },
  //   );
  // }
}
