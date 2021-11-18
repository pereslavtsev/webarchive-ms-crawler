import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { core } from '@webarchiver/protoc';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';
import { CreateTaskDto, CancelTaskDto, GetTaskDto, ListTasksDto } from '../dto';

const { TasksServiceControllerMethods } = core.v1;

@Controller('tasks')
@TasksServiceControllerMethods()
export class TasksController
  extends LoggableProvider
  implements core.v1.TasksServiceController
{
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @UsePipes(new ValidationPipe())
  async listTasks({
    pageSize,
    pageToken,
    orderBy,
  }: ListTasksDto): Promise<core.v1.ListTasksResponse> {
    const { data, cursor } = await this.tasksService.findAll({
      pageSize,
      pageToken,
      orderBy,
    });
    return {
      data,
      nextPageToken: cursor.afterCursor,
    };
  }

  @UsePipes(new ValidationPipe())
  async createTask({ pageId }: CreateTaskDto): Promise<core.v1.Task> {
    return this.tasksService.create(pageId);
  }

  @UsePipes(new ValidationPipe())
  getTask({ id }: GetTaskDto): Promise<core.v1.Task> {
    return this.tasksService.findById(id);
  }

  @UsePipes(new ValidationPipe())
  cancelTask({ id }: CancelTaskDto): Promise<core.v1.Task> {
    return this.tasksService.setCancelled(id);
  }
}
