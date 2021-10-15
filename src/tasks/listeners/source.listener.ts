import { Injectable } from '@nestjs/common';
import { InjectSourcesRepository, OnSourceMatched, Source } from '@app/tasks';
import { Repository } from 'typeorm';
import { ArchiverQueue, InjectArchiverQueue } from '@app/archiver';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import type { SourcesMatchedEvent } from '@app/tasks';

@Injectable()
export class SourceListener extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSourcesRepository()
    private sourceRepository: Repository<Source>,
    @InjectArchiverQueue()
    private archiverQueue: ArchiverQueue,
  ) {
    super(rootLogger);
  }

  @OnSourceMatched()
  async handleSourcesMatchedEvent({ sources, task }: SourcesMatchedEvent) {
    const updatedSources = await this.sourceRepository.save(sources);
    await this.archiverQueue.addBulk(
      updatedSources.map((source) => ({ data: { source, task } })),
    );
  }
}
