import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { grpcClientOptions } from './grpc.options';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcClientOptions,
  );
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
