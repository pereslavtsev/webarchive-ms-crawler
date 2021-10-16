import { Injectable } from '@nestjs/common';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import type { Source, Task } from '@app/tasks';

import { ArchiverQueue } from '../archiver.types';
import { InjectArchiverQueue } from '../archiver.decorators';

@Injectable()
export class ArchiverService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectArchiverQueue()
    private archiverQueue: ArchiverQueue,
  ) {
    super(rootLogger);
  }

  async submit(task: Task, sources: Source[]) {
    return this.archiverQueue.addBulk(
      sources.map((source) => ({
        data: { source, task },
        opts: {
          jobId: `source_${source.id}`,
        },
      })),
    );
  }
}
