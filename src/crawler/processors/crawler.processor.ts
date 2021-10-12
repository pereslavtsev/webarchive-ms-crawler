import { Job, DoneCallback } from 'bull';
import { NestFactory } from '@nestjs/core';
import { mwn } from 'mwn';
import { CoreModule } from '../../core';
import { MwnConstants } from 'nest-mwn';
import { INestApplicationContext } from '@nestjs/common';
import { WatcherJob } from '../crawler.types';

let app: INestApplicationContext;

export default async function (job: WatcherJob, cb: DoneCallback) {
  try {
    console.log('mwn2', 111);
    app = await NestFactory.createApplicationContext(CoreModule);
    const bot = app.get<mwn>(MwnConstants.MWN_INSTANCE);
    for await (const { query } of bot.continuedQueryGen(job.data)) {
      console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);
      //console.log('query.pages', query.pages);
      await job.progress(query.pages);
    }
    cb(null, '55It works');
  } catch (error) {
    console.log('error', error);
  } finally {
    await app.close();
  }
}
