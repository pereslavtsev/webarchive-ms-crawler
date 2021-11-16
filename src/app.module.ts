import { Module } from '@nestjs/common';
import { SharedModule } from '@core/shared';
// import { TasksModule } from '@core/tasks';
import { TemplatesModule } from '@core/templates';
import { WriterModule } from '@core/writer';
import { SourcesModule } from '@core/sources';

@Module({
  imports: [
    SharedModule,
    // TasksModule,
    TemplatesModule,
    WriterModule,
    SourcesModule,
  ],
})
export class AppModule {}
