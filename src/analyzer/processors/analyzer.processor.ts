import { INestApplicationContext } from '@nestjs/common';
import { CrawlerJob } from '../../crawler/crawler.types';
import { DoneCallback } from 'bull';
import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../../core';
import { mwn } from 'mwn';
import { MwnConstants } from 'nest-mwn';
import { AnalyzerJob } from '../analyzer.types';

let app: INestApplicationContext;

export default async function (job: AnalyzerJob, cb: DoneCallback) {
  try {
    if (!app) {
      app = await NestFactory.createApplicationContext(CoreModule);
    }

    const [
      {
        slots: {
          main: { content },
        },
      },
    ] = job.data.page.revisions;

    const bot = app.get<mwn>(MwnConstants.MWN_INSTANCE);
    console.log('content', content);
    const wkt = new bot.wikitext(content);
    const templates = wkt.parseTemplates({});
    console.log('templates', ...templates);
    cb(null, true);
  } catch (error) {
    console.log('error', error);
  } finally {
    await app.close();
  }
}
