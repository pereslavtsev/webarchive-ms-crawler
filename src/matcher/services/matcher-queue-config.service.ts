import { CoreProvider } from '@app/core';
import type { BullModuleOptions, BullOptionsFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { MATCHER_QUEUE } from '../matcher.constants';

@Injectable()
export class MatcherQueueConfigService
  extends CoreProvider
  implements BullOptionsFactory
{
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }

  createBullOptions(): BullModuleOptions {
    return {
      name: MATCHER_QUEUE,
    };
  }
}
