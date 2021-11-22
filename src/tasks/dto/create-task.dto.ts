import { PickType } from '@nestjs/mapped-types';
import { Task } from '../models';
import type { core } from '@webarchiver/protoc';

export class CreateTaskDto
  extends PickType(Task, ['pageId'] as const)
  implements core.v1.CreateTaskRequest {}
