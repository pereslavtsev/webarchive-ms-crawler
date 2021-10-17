import { Injectable } from '@nestjs/common';
import { mwn, Template } from 'mwn';

import { CiteTemplate } from '../interfaces';
import { TEMPLATES } from '../mocks/cite-templates.mock';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { InjectBot } from 'nest-mwn';

@Injectable()
export class CiteTemplatesService extends CoreProvider {
  private readonly data = TEMPLATES;

  constructor(@RootLogger() rootLogger: Bunyan, @InjectBot() private bot: mwn) {
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
    const wkt = new this.bot.wikitext(after);
    const [firstTemplate] = wkt.parseTemplates({});
    const marked =
      !!firstTemplate &&
      !!after.match(/^\s+?{{/m) &&
      [
        'недоступная ссылка',
        'мёртвая ссылка',
        'битая ссылка',
        'deadlink',
        'dead link',
      ].includes(String(firstTemplate.name).toLowerCase());
    return dead || marked;
  }

  getUrlValue(template: Template): string {
    const t = this.findByName(template.name as string);
    return t.urlParamAliases
      .map((param) => template.getValue(param))
      .find((v) => !!v);
  }
}
