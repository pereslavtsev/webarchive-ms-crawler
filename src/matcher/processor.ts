import { NestFactory } from '@nestjs/core';
import { isMainThread, workerData } from 'worker_threads';
import { MatcherService } from './services';
import { ProcessorModule } from './processor.module';
import { INestApplicationContext } from '@nestjs/common';

let app: INestApplicationContext;

async function bootstrap() {
  app = await NestFactory.createApplicationContext(ProcessorModule);
  const matcherService = app.get(MatcherService);
  await matcherService.match(workerData.task);
}

if (!isMainThread) {
  bootstrap().finally(() => app.close());
}
