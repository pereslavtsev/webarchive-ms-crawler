import {
  BeforeApplicationShutdown,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { InjectArchiverQueue } from './archiver.decorators';
import { ArchiverQueue } from './archiver.types';
import { ARCHIVER_QUEUE } from './archiver.constants';
import { MementoModule } from '@app/memento';
import { ArchiverConsumer } from './consumers';

@Module({
  imports: [
    MementoModule,
    BullModule.registerQueue({
      name: ARCHIVER_QUEUE,
    }),
  ],
  providers: [ArchiverConsumer],
  exports: [BullModule],
})
export class ArchiverModule implements OnModuleInit, BeforeApplicationShutdown {
  constructor(
    @InjectArchiverQueue()
    private archiverQueue: ArchiverQueue,
  ) {}

  async beforeApplicationShutdown() {
    await this.archiverQueue.clean(0, 'completed');
    await this.archiverQueue.clean(0, 'active');
    await this.archiverQueue.clean(0, 'delayed');
    await this.archiverQueue.clean(0, 'failed');
    await this.archiverQueue.close(true);
    await this.archiverQueue.close(true);
  }

  async onModuleInit() {
    await this.archiverQueue.pause();
    await this.archiverQueue.empty();
    await this.archiverQueue.clean(0, 'completed');
    await this.archiverQueue.clean(0, 'active');
    await this.archiverQueue.clean(0, 'delayed');
    await this.archiverQueue.clean(0, 'failed');
  }
}
