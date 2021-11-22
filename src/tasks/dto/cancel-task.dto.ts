import type { core } from '@webarchiver/protoc';
import { Task } from '../models';
import { PickType } from '@nestjs/mapped-types';

export class CancelTaskDto
  extends PickType(Task, ['id'] as const)
  implements core.v1.GetTaskRequest {}
