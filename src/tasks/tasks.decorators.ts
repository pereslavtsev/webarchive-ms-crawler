import { InjectRepository } from '@nestjs/typeorm';
import { Source, Task, Memento } from './models';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { WRITER_QUEUE } from './tasks.constants';

// Repositories
export function InjectTasksRepository() {
  return InjectRepository(Task);
}

export function InjectSourcesRepository() {
  return InjectRepository(Source);
}

export function InjectMementosRepository() {
  return InjectRepository(Memento);
}

// Events
export function OnSourceArchived() {
  return OnEvent('source.archived');
}

export function OnSourceChecked() {
  return OnEvent('source.checked');
}

export function OnSourceFailed() {
  return OnEvent('source.failed');
}

export function OnSourceMatched() {
  return OnEvent('source.matched');
}

// Queues
export function InjectWriterQueue() {
  return InjectQueue(WRITER_QUEUE);
}
