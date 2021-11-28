import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import type { tasks } from '@pereslavtsev/webarchiver-protoc';

export class CreateTaskDto
  extends PickType(Task, ['pageId'] as const)
  implements tasks.CreateTaskRequest {}
