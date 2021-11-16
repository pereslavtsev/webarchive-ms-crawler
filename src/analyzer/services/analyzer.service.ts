import { Injectable } from '@nestjs/common';
// import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
// import type { Task, Source } from '@app/tasks';
import { InjectAnalyzerQueue } from '../analyzer.decorators';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { ApiPage, ApiRevision, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { TemplatesService } from '@core/templates';
// import type { AnalyzerQueue } from '../analyzer.types';

@Injectable()
export class AnalyzerService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private templatesService: TemplatesService,
    @InjectBot() private readonly bot: mwn, // @InjectAnalyzerQueue() // private analyzerQueue: AnalyzerQueue,
  ) {
    super(rootLogger);
  }

  async analyze(revision: ApiRevision) {
    const {
      slots: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        main: { content, texthidden },
      },
    } = revision;
    const wkt = new this.bot.wikitext(content);

    const templates = await this.templatesService.findAll();
    const names = templates.flatMap((template) => [
      template.title,
      ...template.aliases,
    ]);

    wkt.parseTemplates({
      templatePredicate: (template) => {
        return names.includes(String(template.name));
      },
    });
  }

  // async submit(task: Task, source: Source) {
  //   await this.analyzerQueue.add(
  //     { source, task },
  //     { jobId: `source_${source.id}` },
  //   );
  // }
}
