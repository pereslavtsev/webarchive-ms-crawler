import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: true,
  logging: true,

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],

  namingStrategy: new SnakeNamingStrategy(),
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
};

export = config;
