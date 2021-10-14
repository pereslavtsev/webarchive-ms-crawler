import { Injectable } from '@nestjs/common';
import { InjectSourcesRepository, OnSourceMatched, Source } from '@app/tasks';
import { Repository } from 'typeorm';
import { ArchiverQueue, InjectArchiverQueue } from '@app/archiver';

@Injectable()
export class SourceListener {
  constructor(
    @InjectSourcesRepository()
    private sourceRepository: Repository<Source>,
    @InjectArchiverQueue()
    private archiverQueue: ArchiverQueue,
  ) {}

  @OnSourceMatched()
  async handleSourcesMatchedEvent(payload: Source[]) {
    const sources = await this.sourceRepository.save(payload);
    await this.archiverQueue.addBulk(
      sources.map((source) => ({ data: { source } })),
    );
  }
}
