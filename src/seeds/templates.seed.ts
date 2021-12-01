import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Template } from '@core/templates';

export default class Templates implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.getRepository(Template).save({
      id: '0f0910ae-3d52-468d-959f-f2f2ac2db1bf',
      title: 'cite web',
      aliases: ['citeweb', 'cw', 'citeweb'],
      pageId: 190642,
      titleParam: 'title',
      titleParamAliases: ['заголовок'],
      defaultUrlParam: 'url',
      urlParamAliases: ['url', 'ссылка'],
      archiveUrlParam: 'archive-url',
      archiveUrlParamAliases: [
        'archive-url',
        'archiveurl',
        'URL архивной копии',
      ],
      archiveDateParam: 'archive-date',
      archiveDateParamAliases: ['дата архивирования', 'archivedate'],
      deadUrlParam: 'deadlink',
      deadUrlParamAliases: [
        'мёртвая ссылка',
        'deadlink',
        'deadurl',
        'dead-url',
      ],
    });
  }
}
