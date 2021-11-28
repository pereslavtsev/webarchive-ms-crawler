import type { tasks } from '@pereslavtsev/webarchiver-protoc';
import { Task } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class CancelTaskDto
  extends PickType(Task, ['id'] as const)
  implements tasks.GetTaskRequest {}
