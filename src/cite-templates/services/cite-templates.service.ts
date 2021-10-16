import { Injectable } from '@nestjs/common';
import { Template } from 'mwn';

import { CiteTemplate } from '../interfaces';
import { TEMPLATES } from '../mocks/cite-templates.mock';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class CiteTemplatesService extends CoreProvider {
  private readonly data = TEMPLATES;

  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }

  findByName(name: string): CiteTemplate {
    return this.data.find((t) => t.name === name.toLowerCase());
  }

  isArchived(template: Template): boolean {
    const t = this.findByName(template.name as string);
    return t.archiveUrlParamAliases.some((param) => template.getParam(param));
  }

  isDead(template: Template, content: string): boolean {
    const t = this.findByName(template.name as string);
    const dead = t.deadLinkParamAliases?.some(
      (param) => template.getValue(param) === 'yes',
    );
    const [, after] = content.split(template.wikitext);
    const marked = after.match(
      /^{{(недоступная ссылка|мёртвая ссылка|битая ссылка|deadlink|dead link)/i,
    );
    return dead ?? !!marked;
  }

  getUrlValue(template: Template): string {
    const t = this.findByName(template.name as string);
    return t.urlParamAliases
      .map((param) => template.getValue(param))
      .find((v) => !!v);
  }
}
