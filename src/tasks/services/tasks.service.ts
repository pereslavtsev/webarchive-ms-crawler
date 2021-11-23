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
import { isMainThread } from 'worker_threads';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { ListTasksDto } from '../dto';
import { plainToClass } from 'class-transformer';

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
    if (isMainThread) {
      //await this.tasksRepository.delete({});
    }
  }

  async create(pageId: ApiPage['pageid']): Promise<Task> {
    const task = await this.tasksRepository.save({ pageId });
    this.eventEmitter.emit('task.created', task);
    return plainToClass(Task, task);
  }

  async checkAllForArchived(): Promise<Task[]> {
    let tasks = plainToClass(
      Task,
      await this.tasksRepository.find({
        where: {
          status: Task.Status.MATCHED,
        },
      }),
    );

    const failedTasks = tasks.filter((task) => {
      const { sources } = task;

      return sources.every((source) => {
        const { status } = source;

        switch (status) {
          case Source.Status.FAILED:
          case Source.Status.DISCARDED:
          case Source.Status.MISMATCHED: {
            return true;
          }
          default: {
            return false;
          }
        }
      });
    });

    await this.tasksRepository.save(
      failedTasks.map((task) => ({ ...task, status: Task.Status.FAILED })),
    );

    tasks = plainToClass(
      Task,
      await this.tasksRepository.find({
        where: {
          status: Task.Status.MATCHED,
        },
      }),
    );

    const archivedTasks = tasks.filter((task) => {
      const { sources } = task;

      return sources.every((source) => {
        const { status } = source;

        switch (status) {
          case Source.Status.ARCHIVED:
          case Source.Status.DISCARDED:
          case Source.Status.MISMATCHED: {
            return true;
          }
          default: {
            return false;
          }
        }
      });
    });

    await this.tasksRepository.save(
      archivedTasks.map((task) => ({ ...task, status: Task.Status.ARCHIVED })),
    );

    return this.tasksRepository.find({
      where: {
        status: Task.Status.ARCHIVED,
      },
    });
  }

  async checkForArchived(taskId: Task['id']): Promise<Task | null> {
    const { sources, ...task } = await this.findById(taskId);

    const failed = sources.filter((source) => {
      const { status } = source;

      switch (status) {
        case Source.Status.FAILED:
        case Source.Status.DISCARDED:
        case Source.Status.MISMATCHED: {
          return true;
        }
        default: {
          return false;
        }
      }
    });

    if (failed.length === sources.length) {
      this.log.debug(`mark as failed ${task.id}`);
      const updatedTask = await this.tasksRepository.save({
        ...task,
        status: Task.Status.FAILED,
      });

      return { ...updatedTask, sources };
    }

    const archived = sources.filter((source) => {
      const { status } = source;

      switch (status) {
        case Source.Status.ARCHIVED:
        case Source.Status.DISCARDED:
        case Source.Status.MISMATCHED: {
          return true;
        }
        default: {
          return false;
        }
      }
    });

    if (
      archived.length !== sources.length ||
      task.status !== Task.Status.MATCHED
    ) {
      this.log.debug(
        `progress: ${archived.length} archived from ${sources.length} total, ${task.id}`,
      );
      return null;
    }

    this.log.debug(`mark as archived ${task.id}`);
    const updatedTask = await this.tasksRepository.save({
      ...task,
      status: Task.Status.ARCHIVED,
    });

    return { ...updatedTask, sources };
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
    updatedTask.sources.forEach((source) =>
      this.eventEmitter.emit('source.created', source),
    );
    return updatedTask;
  }

  protected async setStatus(
    taskId: Task['id'],
    status: Task['status'],
  ): Promise<Task> {
    const task = await this.findById(taskId);
    const updatedTask = this.tasksRepository.save({ ...task, status });
    return plainToClass(Task, updatedTask);
  }

  async setFailed(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.FAILED);
    this.eventEmitter.emit('task.failed', task);
    return task;
  }

  async setSkipped(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.SKIPPED);
    this.eventEmitter.emit('task.skipped', task);
    return task;
  }

  async setCancelled(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.CANCELLED);
    this.eventEmitter.emit('task.cancelled', task);
    return task;
  }

  async setAccepted(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.ACCEPTED);
    this.eventEmitter.emit('task.accepted', task);
    return task;
  }

  async setMatched(taskId: Task['id']): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.MATCHED);
    this.eventEmitter.emit('task.matched', task);
    return task;
  }

  async setDone(taskId: Task['id'], newRevisionId: number): Promise<Task> {
    const task = await this.setStatus(taskId, Task.Status.DONE);
    const updatedTask = await this.tasksRepository.save({
      ...task,
      newRevisionId,
    });
    this.eventEmitter.emit('task.done', updatedTask);
    return updatedTask;
  }

  async findById(taskId: Task['id']): Promise<Task> {
    const task = await this.tasksRepository.findOneOrFail(taskId);
    return plainToClass(Task, task);
  }

  findAll({ pageSize, pageToken }: ListTasksDto) {
    const queryBuilder = this.tasksRepository.createQueryBuilder('task');

    const paginator = buildPaginator({
      entity: Task,
      paginationKeys: ['id'],
      query: {
        limit: pageSize,
        order: 'DESC',
        afterCursor: pageToken,
      },
    });

    return paginator.paginate(queryBuilder);
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
