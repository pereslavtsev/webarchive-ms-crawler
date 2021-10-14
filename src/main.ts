import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { grpcClientOptions } from './grpc.options';
import { Logger } from '@app/core';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    ...grpcClientOptions,
    logger: new Logger(),
  });
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
