import { Module } from '@nestjs/common';
import { CiteTemplatesService } from './services';

@Module({
  providers: [CiteTemplatesService],
  exports: [CiteTemplatesService],
})
export class CiteTemplatesModule {}
