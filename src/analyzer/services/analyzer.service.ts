import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

export class AnalyzerService extends CoreProvider {
  constructor(@RootLogger() rootLogger: Bunyan) {
    super(rootLogger);
  }
}
