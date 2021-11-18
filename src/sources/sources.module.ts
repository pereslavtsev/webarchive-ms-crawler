import { Module } from '@nestjs/common';
import { SourcesService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([Source])],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
