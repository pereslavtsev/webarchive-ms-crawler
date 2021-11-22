import { Inject, Injectable } from '@nestjs/common';
import { MwnModuleOptions, MwnModuleOptionsFactory } from 'nest-mwn';
import { mwn as mwnConfig } from '../config';
import { ConfigType } from '@nestjs/config';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class MwnConfigService
  extends LoggableProvider
  implements MwnModuleOptionsFactory
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @Inject(mwnConfig.KEY)
    private config: ConfigType<typeof mwnConfig>,
  ) {
    super(rootLogger);
  }

  createMwnModuleOptions(): MwnModuleOptions {
    return {
      apiUrl: 'https://ru.wikipedia.org/w/api.php',
      username: this.config.username,
      password: this.config.password,
    };
  }
}
