import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConnectionOptions } from 'typeorm-seeding';
import baseConfig  from './ormconfig';

const config: ConnectionOptions = {
  ...baseConfig,
  entities: [__dirname + '/**/*.model{.ts,.js}'],
  seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
  factories: [__dirname + '/factories/**/*{.ts,.js}'],
};

export = config;
