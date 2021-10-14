import { Injectable } from '@nestjs/common';
import { Template } from 'mwn';
import { Source } from '../models';
import { CiteTemplatesService } from '@app/cite-templates';

@Injectable()
export class SourcesService {
  constructor(private citeTemplatesService: CiteTemplatesService) {}

  create(template: Template): Source {
    const source = new Source();
    source.url = this.citeTemplatesService.getUrlValue(template);
    source.title = template.getValue('title');
    source.templateName = String(template.name).toLowerCase();
    source.templateWikitext = template.wikitext;
    return source;
  }
}
