import { Inject, Injectable } from '@nestjs/common';
import { SharedBullConfigurationFactory } from '@nestjs/bull';
import * as Bull from 'bull';
import { ConfigType } from '@nestjs/config';
import bullConfig from '../config/bull.config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(
    @Inject(bullConfig.KEY)
    private config: ConfigType<typeof bullConfig>,
  ) {}

  createSharedConfiguration(): Bull.QueueOptions {
    return {
      redis: this.config.url as unknown,
    };
  }
}
