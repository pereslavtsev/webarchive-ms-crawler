import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { core } from '@webarchiver/protoc';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { TasksService } from '../services';

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
  listTasks(
    request: core.v1.ListTasksRequest,
  ): Promise<core.v1.ListTasksResponse> {
    return {} as any;
  }

  @UsePipes(new ValidationPipe())
  createTask({ pageId }: core.v1.CreateTaskRequest): Promise<core.v1.Task> {
    return this.tasksService.create(pageId);
  }

  @UsePipes(new ValidationPipe())
  getTask(request: core.v1.GetTaskRequest): Promise<core.v1.Task> {
    return {} as any;
  }

  @UsePipes(new ValidationPipe())
  cancelTask(request: core.v1.CancelTaskRequest): Promise<core.v1.Task> {
    return {} as any;
  }
}
