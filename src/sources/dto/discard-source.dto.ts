import type { core } from '@webarchiver/protoc';
import { PickType } from '@nestjs/mapped-types';
import { Source } from '@core/sources';

export class DiscardSourceDto
  extends PickType(Source, ['id'] as const)
  implements core.v1.DiscardSourceRequest {}
