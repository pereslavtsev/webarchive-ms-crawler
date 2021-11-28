import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export class OnTask {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor() {}

  protected static createDecorator(event: string) {
    return OnEvent(`task.${event}`);
  }

  static Created() {
    return this.createDecorator('created');
  }

  static Skipped() {
    return this.createDecorator('skipped');
  }

  static Accepted() {
    return this.createDecorator('accepted');
  }

  static Cancelled() {
    return this.createDecorator('cancelled');
  }

  static Archived() {
    return this.createDecorator('archived');
  }

  static Failed() {
    return this.createDecorator('failed');
  }
}
