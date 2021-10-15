import type { Source, Task } from '@app/tasks';

export class SourcesMatchedEvent {
  task: Task;
  sources: Source[];
}
