import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPage, mwn } from 'mwn';
import { InjectTasksRepository } from '../tasks.decorators';
import { InjectBot } from 'nest-mwn';
import { Repository } from 'typeorm';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { Task } from '../models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Source } from '@core/sources';

@Injectable()
export class TasksService extends LoggableProvider implements OnModuleInit {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private bot: mwn,
    @InjectTasksRepository()
    private tasksRepository: Repository<Task>,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  async onModuleInit() {
    await this.tasksRepository.delete({});
  }

  async create(pageId: ApiPage['pageid']): Promise<Task> {
    const task = await this.tasksRepository.save({ pageId });
    this.eventEmitter.emit('task.created', task);
    return task;
  }

  async addSources(
    taskId: Task['id'],
    revisionId: Task['revisionId'],
    sources: Source[],
  ) {
    const task = await this.findById(taskId);
    const updatedTask = await this.tasksRepository.save({
      ...task,
      revisionId,
      sources,
    });
    updatedTask.sources.forEach(() => this.eventEmitter.emit('source.created'));
    return updatedTask;
  }

  protected async setStatus(
    taskId: Task['id'],
    status: Task['status'],
  ): Promise<Task> {
    const task = await this.findById(taskId);
    return this.tasksRepository.save({ ...task, status });
  }

  async setFailed(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.FAILED);
    this.eventEmitter.emit('task.failed');
    return task;
  }

  async setSkipped(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.SKIPPED);
    this.eventEmitter.emit('task.skipped');
    return task;
  }

  async setAccepted(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.ACCEPTED);
    this.eventEmitter.emit('task.accepted');
    return task;
  }

  async findById(taskId: Task['id']) {
    return this.tasksRepository.findOneOrFail(taskId);
  }

  // createByPage(page: ApiPage): Task {
  //   const [latestRevision] = page.revisions;
  //   const {
  //     slots: {
  //       main: { content },
  //     },
  //   } = latestRevision;
  //   const wkt = new this.bot.wikitext(content);
  //   const templates = wkt.parseTemplates({
  //     namePredicate: (name) => !!this.citeTemplatesService.findByName(name),
  //     templatePredicate: (template) => {
  //       const archived = this.citeTemplatesService.isArchived(template);
  //       const url = this.citeTemplatesService.getUrlValue(template);
  //       return !archived && !!url; // unarchived sources with url
  //     },
  //   });
  //
  //   const task = new Task();
  //   task.pageId = page.pageid;
  //   task.pageTitle = page.title;
  //   task.revisionId = latestRevision.revid;
  //
  //   if (!templates.length) {
  //     task.status = TaskStatus.SKIPPED;
  //   }
  //
  //   task.sources = templates.map((template) =>
  //     this.sourcesService.create(template, content),
  //   );
  //
  //   return task;
  // }
  //
  // async create(...pages: ApiPage[]) {
  //   const tasks = await this.tasksRepository.find({
  //     pageId: In(pages.map((page) => page.pageid)),
  //   });
  //   const newTasks = pages
  //     .filter(
  //       (page) =>
  //         !tasks
  //           .map((task) => Number(task.pageId))
  //           .includes(Number(page.pageid)),
  //     )
  //     .map((page) => this.createByPage(page));
  //   return this.tasksRepository.save(newTasks);
  // }
  //
  // async setDone(taskId: Task['id'], newRevId: ApiRevision['revid']) {
  //   const task = await this.tasksRepository.findOneOrFail(taskId);
  //   task.status = TaskStatus.DONE;
  //   task.newRevisionId = newRevId;
  //   return this.tasksRepository.save(task);
  // }
  //
  // async setFailed(taskId: Task['id']) {
  //   const task = await this.tasksRepository.findOneOrFail(taskId);
  //   task.status = TaskStatus.FAILED;
  //   return this.tasksRepository.save(task);
  // }
  //
  // async setReady(taskId: Task['id']) {
  //   const task = await this.tasksRepository.findOneOrFail(taskId);
  //   task.status = TaskStatus.READY_TO_DEPLOY;
  //   return this.tasksRepository.save(task);
  // }
  //
  // async resumePending() {
  //   const pendingTasks = await this.tasksRepository.find({
  //     where: {
  //       status: TaskStatus.PENDING,
  //     },
  //   });
  //   await this.matcherService.submit(...pendingTasks);
  // }
}
