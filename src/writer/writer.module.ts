import { Module } from '@nestjs/common';
import { WriterListener } from './listeners';
import { WriterConsumer } from './consumers';
import { TasksModule } from '@core/tasks';
import { BullModule } from '@nestjs/bull';
import { WRITER_QUEUE } from './writer.constants';

@Module({
  imports: [
    TasksModule,
    BullModule.registerQueue({
      name: WRITER_QUEUE,
    }),
  ],
  providers: [WriterConsumer, WriterListener],
})
export class WriterModule {}
