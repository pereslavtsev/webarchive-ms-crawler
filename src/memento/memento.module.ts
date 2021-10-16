import { Module } from '@nestjs/common';
import { MementoHttpConfigService, MementoService } from './services';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: MementoHttpConfigService,
    }),
  ],
  providers: [MementoService],
  exports: [MementoService],
})
export class MementoModule {}
