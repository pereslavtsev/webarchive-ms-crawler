import { core, toDate } from '@webarchiver/protoc';
import { PickType } from '@nestjs/mapped-types';
import { Source } from '@core/sources';
import { Transform } from 'class-transformer';

export class ArchiveSourceDto
  extends PickType(Source, ['id', 'archiveUrl', 'archiveDate'] as const)
  implements core.v1.ArchiveSourceRequest
{
  @Transform(({ value }) => toDate(value))
  archiveDate: Date;
}
