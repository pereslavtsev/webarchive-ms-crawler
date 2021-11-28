import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@core/app.module';
import { grpcClientOptions } from './grpc.options';
import { GrpcLoggingInterceptor } from '@pereslavtsev/webarchiver-misc';
import { Logger } from '@core/shared';
import { ROOT_LOGGER } from '@eropple/nestjs-bunyan';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    ...grpcClientOptions,
    logger: new Logger(),
  });
  const rootLogger = app.get(ROOT_LOGGER);
  app.useGlobalInterceptors(
    new GrpcLoggingInterceptor(rootLogger),
    new ClassSerializerInterceptor(app.get(Reflector), { groups: ['grpc'] }),
  );
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
