import { Job, DoneCallback } from 'bull';
import { NestFactory } from '@nestjs/core';
import { mwn } from 'mwn';
import { CoreModule, Logger } from '@app/core';
import { MwnConstants } from 'nest-mwn';
import { INestApplicationContext } from '@nestjs/common';
import { CrawlerJob } from '../crawler.types';

let app: INestApplicationContext;
let log: Logger;

export default async function (job: CrawlerJob, cb: DoneCallback) {
  try {
    if (!app) {
      app = await NestFactory.createApplicationContext(CoreModule, {
        logger: new Logger(),
      });
      log = app.get(Logger);
    }

    const bot = app.get<mwn>(MwnConstants.MWN_INSTANCE);
    for await (const json of bot.continuedQueryGen(job.data)) {
      if (!json.continue) {
        break;
      }
      await job.progress(json.query.pages);
    }
    cb(null, '55It works');
  } catch (error) {
    log.error('error', error);
  } finally {
    await app.close();
  }
}
