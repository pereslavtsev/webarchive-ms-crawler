import {
  BeforeApplicationShutdown,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CiteTemplatesModule } from '@app/cite-templates';
import { ArchiverModule } from '@app/archiver';
import { AnalyzerModule } from '@app/analyzer';
import { BullModule } from '@nestjs/bull';
import { MatcherModule } from '@app/matcher';
import { Queue } from 'bull';

import {
  InjectSourcesRepository,
  InjectTasksRepository,
  InjectWriterQueue,
} from './tasks.decorators';
import { WriterConsumer } from './consumers';
import * as models from './models';
import * as services from './services';
import * as listeners from './listeners';
import { WRITER_QUEUE } from './tasks.constants';

@Module({
  imports: [
    AnalyzerModule,
    ArchiverModule,
    MatcherModule,
    TypeOrmModule.forFeature([...Object.values(models)]),
    BullModule.registerQueue({
      name: WRITER_QUEUE,
    }),
    CiteTemplatesModule,
  ],
  providers: [
    ...Object.values(services),
    ...Object.values(listeners),
    WriterConsumer,
  ],
  exports: [...Object.values(services)],
})
export class TasksModule implements OnModuleInit, BeforeApplicationShutdown {
  constructor(
    @InjectTasksRepository()
    private tasksRepository: Repository<models.Task>,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<models.Source>,
    @InjectWriterQueue()
    private writerQueue: Queue<models.Task>,
  ) {}

  async onModuleInit() {
    // await this.tasksRepository.delete({});
    // await this.sourcesRepository.delete({});
    await this.writerQueue.pause();
    await this.writerQueue.empty();
    await this.writerQueue.clean(0, 'completed');
    await this.writerQueue.clean(0, 'active');
    await this.writerQueue.clean(0, 'delayed');
    await this.writerQueue.clean(0, 'failed');
  }

  async beforeApplicationShutdown() {
    await this.writerQueue.clean(0, 'completed');
    await this.writerQueue.clean(0, 'active');
    await this.writerQueue.clean(0, 'delayed');
    await this.writerQueue.clean(0, 'failed');
    await this.writerQueue.close(true);
    await this.writerQueue.close(true);
  }
}
