import { Module } from '@nestjs/common';
import { HelloService } from './hero.controller';
import { CoreModule } from './core';
import { CrawlerModule } from './crawler';
import { MatcherModule } from './matcher/matcher.module';
import { MementoModule } from './memento';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { TasksModule } from './tasks/tasks.module';
import { CiteTemplatesModule } from './cite-templates/cite-templates.module';

@Module({
  imports: [CoreModule, CrawlerModule, MatcherModule, MementoModule, AnalyzerModule, TasksModule, CiteTemplatesModule],
  //controllers: [AppController, HelloService],
  //providers: [AppService],
})
export class AppModule {}
