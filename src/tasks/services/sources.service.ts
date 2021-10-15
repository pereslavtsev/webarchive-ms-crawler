import { Injectable } from '@nestjs/common';
import { Template } from 'mwn';
import { Source } from '../models';
import { CiteTemplatesService } from '@app/cite-templates';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class SourcesService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private citeTemplatesService: CiteTemplatesService,
  ) {
    super(rootLogger);
  }

  create(template: Template): Source {
    const source = new Source();
    source.url = this.citeTemplatesService.getUrlValue(template);
    source.title = template.getValue('title');
    source.templateName = String(template.name).toLowerCase();
    source.templateWikitext = template.wikitext;
    return source;
  }
}
