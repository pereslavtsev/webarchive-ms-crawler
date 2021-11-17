import { Injectable } from '@nestjs/common';
import { Template as ApiTemplate } from 'mwn';
import { Source } from '../models';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { InjectSourcesRepository } from '../sources.decorators';
import { Repository } from 'typeorm';
import { TemplatesService } from '@core/templates';

@Injectable()
export class SourcesService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<Source>,
    private templatesService: TemplatesService,
  ) {
    super(rootLogger);
  }

  // create(template: Template, content: string): Source {
  //   const source = new Source();
  //   source.url = this.citeTemplatesService.getUrlValue(template);
  //   source.title = template.getValue('title');
  //   source.templateName = String(template.name).toLowerCase();
  //   source.templateWikitext = template.wikitext;
  //   source.dead = this.citeTemplatesService.isDead(template, content);
  //   return source;
  // }
}
