import { InjectRepository } from '@nestjs/typeorm';
import { Source, Task } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export function InjectSourcesRepository() {
  return InjectRepository(Source);
}

export function OnSourceMatched() {
  return OnEvent('source.matched');
}
