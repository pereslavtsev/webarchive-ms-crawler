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

  getUrlValue(template: Template): string {
    const t = this.findByName(template.name as string);
    return t.urlParamAliases
      .map((param) => template.getValue(param))
      .find((v) => !!v);
  }
}
