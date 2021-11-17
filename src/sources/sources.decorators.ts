import { InjectRepository } from '@nestjs/typeorm';
import { Source } from './models';

export function InjectSourcesRepository() {
  return InjectRepository(Source);
}
