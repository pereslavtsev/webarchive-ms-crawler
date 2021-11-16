import { Transport, ClientOptions } from '@nestjs/microservices';
import { core } from '@webarchiver/protoc';

const port = process.env.PORT || 50051;

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${port}`,
    package: core.v1.protobufPackage,
    protoPath: core.getProtoPath(),
  },
};
