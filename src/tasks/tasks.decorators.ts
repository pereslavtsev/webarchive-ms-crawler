import { InjectRepository } from '@nestjs/typeorm';
import { Source, Task, Memento } from './models';
import { OnEvent } from '@nestjs/event-emitter';

export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export function InjectSourcesRepository() {
  return InjectRepository(Source);
}

export function InjectMementosRepository() {
  return InjectRepository(Memento);
}

export function OnSourceMatched() {
  return OnEvent('source.matched');
}
