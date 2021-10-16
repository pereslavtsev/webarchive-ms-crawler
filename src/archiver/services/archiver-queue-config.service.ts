import { CoreProvider } from '@app/core';
import { Injectable } from '@nestjs/common';
import type { BullModuleOptions, BullOptionsFactory } from '@nestjs/bull';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ARCHIVER_QUEUE } from '../archiver.constants';

@Injectable()
export class ArchiverQueueConfigService
  extends CoreProvider
  implements BullOptionsFactory
{
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }

  createBullOptions(): BullModuleOptions {
    return {
      name: ARCHIVER_QUEUE,
    };
  }
}
