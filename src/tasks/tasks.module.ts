import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as models from './models';
import * as services from './services';
import { Repository } from 'typeorm';
import { CiteTemplatesModule } from '@app/cite-templates';
import { InjectTasksRepository } from './tasks.decorators';

@Module({
  imports: [
    TypeOrmModule.forFeature([...Object.values(models)]),
    CiteTemplatesModule,
  ],
  providers: [...Object.values(services)],
  exports: [TypeOrmModule, ...Object.values(services)],
})
export class TasksModule implements OnModuleInit {
  constructor(
    @InjectTasksRepository()
    private tasksRepository: Repository<models.Task>,
  ) {}

  async onModuleInit() {
    await this.tasksRepository.delete({});
  }
}
