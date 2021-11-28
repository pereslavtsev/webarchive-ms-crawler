import { Module } from '@nestjs/common';
import { TemplatesService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template, TemplateSettings as Settings } from './models';

@Module({
  imports: [TypeOrmModule.forFeature([Template, Settings])],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
