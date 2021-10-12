import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { InjectBot, MwnModule } from 'nest-mwn';
import { mwn } from 'mwn';
import { EventEmitterModule } from '@nestjs/event-emitter';

import bullConfig from './config/bull.config';
import mwnConfig from './config/mwn.config';
import { BullConfigService, MwnConfigService } from './services';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [bullConfig, mwnConfig],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MwnModule.forRootAsync({
      useClass: MwnConfigService,
    }),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
  exports: [BullModule, MwnModule],
})
export class CoreModule implements OnModuleInit {
  constructor(
    @InjectBot()
    private readonly bot: mwn,
  ) {}

  async onModuleInit() {
    await this.bot.login();
  }
}
