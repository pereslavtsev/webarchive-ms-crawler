import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:9090',
    package: 'hello',
    protoPath: join(__dirname, './crawler.proto'),
  },
};
