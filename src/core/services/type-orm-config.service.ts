import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigType } from '@nestjs/config';

import { database } from '../config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(database.KEY)
    private dbConfig: ConfigType<typeof database>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.dbConfig.url,
      entities: [__dirname, 'dist/**/*.model{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
      logging: true,
    };
  }
}
