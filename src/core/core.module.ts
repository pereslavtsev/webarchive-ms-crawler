import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectBot, MwnModule } from 'nest-mwn';
import { mwn } from 'mwn';
import { EventEmitterModule } from '@nestjs/event-emitter';

import * as config from './config';
import {
  BullConfigService,
  MwnConfigService,
  TypeOrmConfigService,
} from './services';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...Object.values(config)],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MwnModule.forRootAsync({
      useClass: MwnConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
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
