import type { tasks } from '@pereslavtsev/webarchiver-protoc';
import { Max, Min } from 'class-validator';

export class ListTasksDto implements tasks.ListTasksRequest {
  @Min(1)
  @Max(50)
  readonly pageSize: number;

  readonly pageToken: string;

  readonly orderBy: string;
}
