import { InjectRepository } from '@nestjs/typeorm';
import { Source } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectSourcesRepository() {
  return InjectRepository(Source);
}

export class OnSource {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  protected static createDecorator(event: string) {
    return OnEvent(`source.${event}`);
  }

  static Archived() {
    return this.createDecorator('archived');
  }
}
