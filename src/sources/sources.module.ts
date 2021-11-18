import { Module } from '@nestjs/common';
import { SourcesService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './models';
import { SourcesController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Source])],
  providers: [SourcesService],
  exports: [SourcesService],
  controllers: [SourcesController],
})
export class SourcesModule {}
