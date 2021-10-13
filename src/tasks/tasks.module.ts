import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as models from './models';
import { Repository } from 'typeorm';
import { InjectTasksRepository } from './tasks.decorators';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(models)])],
  exports: [TypeOrmModule],
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
