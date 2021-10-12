import { BeforeApplicationShutdown, Controller, OnModuleInit } from "@nestjs/common";
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { InjectBot } from 'nest-mwn';
import { ApiPage, mwn } from 'mwn';
import * as workerpool from 'workerpool';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

// interface HelloService {
//   bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
//   lotsOfGreetings(
//     upstream: Observable<HelloRequest>,
//   ): Observable<HelloResponse>;
// }

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}

@Controller()
export class HelloService {
  constructor(
    @InjectBot()
    private readonly bot: mwn,
  ) {}

  @GrpcStreamMethod('HelloService', 'bidiHello')
  bidiHello(
    messages: Observable<HelloResponse>,
    metadata: Metadata,
    call: ServerDuplexStream<any, any>,
  ): Observable<any> {
    const subject = new Subject<HelloResponse>();

    const onNext = (message) => {
      console.log(message);
      for (let i = 0; i < 10; i++) {
        subject.next({
          reply: 'Hello, world! ' + Date.now(),
        });
      }
    };
    const onComplete = () => subject.complete();
    messages.subscribe({
      next: onNext,
      //complete: onComplete,
    });

    return subject.asObservable();
  }
}
