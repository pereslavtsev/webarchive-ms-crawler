import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { core } from '@webarchiver/protoc';
import { from, Observable, Subject } from 'rxjs';
import { ArchiveSourceDto, GetSourcesDto } from '../dto';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { SourcesService } from '../services';
import { OnEvent } from '@nestjs/event-emitter';
import { Source } from '@core/sources';
import { Task } from '@core/tasks';
import { plainToClass } from 'class-transformer';

const { SourcesServiceControllerMethods } = core.v1;

@Controller('sources')
@SourcesServiceControllerMethods()
export class SourcesController
  extends LoggableProvider
  implements core.v1.SourcesServiceController
{
  protected readonly subscriptions: Map<
    core.v1.Task['id'],
    Subject<core.v1.Source>
  > = new Map();

  constructor(
    @RootLogger() rootLogger: Bunyan,
    private sourcesService: SourcesService,
  ) {
    super(rootLogger);
  }

  @OnEvent('source.*')
  handleSourcesEvents(source: Source) {
    const subject = this.subscriptions.get(source.taskId);

    if (!subject) {
      return;
    }

    subject.next(source);
  }

  @OnEvent('task.*')
  handleTaskEvents(task: Task) {
    const subject = this.subscriptions.get(task.id);
    if (!subject) {
      return;
    }

    switch (task.status) {
      case Task.Status.DONE:
      case Task.Status.FAILED:
      case Task.Status.SKIPPED:
      case Task.Status.CANCELLED: {
        subject.complete();
        this.subscriptions.delete(task.id);
      }
    }
  }

  @UsePipes(new ValidationPipe())
  getSourcesStream({ taskId }: GetSourcesDto): Observable<core.v1.Source> {
    const subject = new Subject<core.v1.Source>();

    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, subject);
    }

    from(this.sourcesService.findByTaskId(taskId)).subscribe((sources) => {
      sources.forEach((source) => subject.next(source));
    });
    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  archiveSource({ id, ...data }: ArchiveSourceDto): Promise<core.v1.Source> {
    return this.sourcesService.archive(
      id,
      plainToClass(ArchiveSourceDto, data),
    );
  }
}
