import type { core } from '@webarchiver/protoc';
import { PickType } from '@nestjs/mapped-types';
import { Source } from '@core/sources';

export class GetSourcesDto
  extends PickType(Source, ['taskId'] as const)
  implements core.v1.GetSourcesRequest {}
