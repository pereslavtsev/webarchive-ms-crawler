import { Module } from '@nestjs/common';
import { HttpConfigService, MementoService } from './services';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  providers: [MementoService],
  exports: [MementoService],
})
export class MementoModule {}
