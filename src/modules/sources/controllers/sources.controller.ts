import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { sources } from '@pereslavtsev/webarchiver-protoc';
import { from, Observable, Subject } from 'rxjs';
import { ArchiveSourceDto, GetSourcesDto, DiscardSourceDto } from '../dto';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { SourcesService } from '../services';
import { OnEvent } from '@nestjs/event-emitter';
import { Source } from '../models';
import { Task } from '@core/tasks';
import { plainToClass } from 'class-transformer';

const { SourcesServiceControllerMethods } = sources;

type SourcesSubscriptionsMap = Map<Task['id'], Subject<Source>>;

@Controller('sources')
@SourcesServiceControllerMethods()
export class SourcesController
  extends LoggableProvider
  implements sources.SourcesServiceController
{
  protected readonly subscriptions: SourcesSubscriptionsMap = new Map();

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
  getSourcesStream({ taskId }: GetSourcesDto): Observable<Source> {
    const subject = new Subject<Source>();

    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, subject);
    }

    from(this.sourcesService.findByTaskId(taskId)).subscribe((sources) => {
      sources.forEach((source) => subject.next(source));
    });
    return subject.asObservable();
  }

  @UsePipes(new ValidationPipe())
  archiveSource({ id, ...data }: ArchiveSourceDto): Promise<Source> {
    return this.sourcesService.archive(
      id,
      plainToClass(ArchiveSourceDto, data),
    );
  }

  @UsePipes(new ValidationPipe())
  discardSource({ id }: DiscardSourceDto): Promise<Source> {
    return this.sourcesService.discard(id);
  }
}
