import { CiteTemplate } from '../interfaces/cite-template.interface';

export const TEMPLATES: CiteTemplate[] = [
  {
    name: 'cite web',
    urlParamAliases: ['url', 'ссылка'],
    archiveUrlParam: 'archive-url',
    archiveUrlParamAliases: ['archive-url', 'archiveurl'],
    archiveDateParam: 'archive-date',
  },
  {
    name: 'cite news',
    urlParamAliases: ['url'],
    archiveUrlParam: 'archiveurl',
    archiveUrlParamAliases: ['archiveurl'],
    archiveDateParam: 'archivedate',
  },
];
