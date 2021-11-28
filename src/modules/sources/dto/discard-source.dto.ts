import type { sources } from '@pereslavtsev/webarchiver-protoc';
import { PickType } from '@nestjs/mapped-types';
import { Source } from '@core/sources';

export class DiscardSourceDto
  extends PickType(Source, ['id'] as const)
  implements sources.DiscardSourceRequest {}
