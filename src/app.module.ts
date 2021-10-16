import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { CrawlerModule } from '@app/crawler';
import { TasksModule } from '@app/tasks';
import { CiteTemplatesModule } from '@app/cite-templates';

@Module({
  imports: [CoreModule, CrawlerModule, TasksModule, CiteTemplatesModule],
  //controllers: [AppController, HelloService],
  //providers: [AppService],
})
export class AppModule {}
