import { Module } from '@nestjs/common';
import { HelloService } from './hero.controller';
import { CoreModule } from '@app/core';
import { CrawlerModule } from '@app/crawler';
import { MatcherModule } from '@app/matcher';
import { AnalyzerModule } from '@app/analyzer';
import { TasksModule } from '@app/tasks';
import { CiteTemplatesModule } from '@app/cite-templates';
import { ArchiverModule } from '@app/archiver';

@Module({
  imports: [
    CoreModule,
    CrawlerModule,
    MatcherModule,
    AnalyzerModule,
    TasksModule,
    CiteTemplatesModule,
    ArchiverModule,
  ],
  //controllers: [AppController, HelloService],
  //providers: [AppService],
})
export class AppModule {}
