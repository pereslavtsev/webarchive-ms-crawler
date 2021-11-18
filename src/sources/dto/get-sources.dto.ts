import type { core } from '@webarchiver/protoc';
import { IsUUID } from 'class-validator';
import type { Task } from '@core/tasks';

export class GetSourcesDto implements core.v1.GetSourcesRequest {
  @IsUUID()
  readonly taskId: Task['id'];
}
