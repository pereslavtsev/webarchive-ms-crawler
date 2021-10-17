import { Injectable } from '@nestjs/common';
import { ApiPage, ApiRevision, mwn } from 'mwn';
import { InjectTasksRepository, Task, TaskStatus } from '@app/tasks';
import { SourcesService } from './sources.service';
import { InjectBot } from 'nest-mwn';
import { CiteTemplatesService } from '@app/cite-templates';
import { Repository } from 'typeorm';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

@Injectable()
export class TasksService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private bot: mwn,
    private citeTemplatesService: CiteTemplatesService,
    private sourcesService: SourcesService,
    @InjectTasksRepository()
    private tasksRepository: Repository<Task>,
  ) {
    super(rootLogger);
  }

  createByPage(page: ApiPage): Task {
    const [latestRevision] = page.revisions;
    const {
      slots: {
        main: { content },
      },
    } = latestRevision;
    const wkt = new this.bot.wikitext(content);
    const templates = wkt.parseTemplates({
      namePredicate: (name) => !!this.citeTemplatesService.findByName(name),
      templatePredicate: (template) => {
        const archived = this.citeTemplatesService.isArchived(template);
        const url = this.citeTemplatesService.getUrlValue(template);
        return !archived && !!url; // unarchived sources with url
      },
    });

    const task = new Task();
    task.pageId = page.pageid;
    task.pageTitle = page.title;
    task.revisionId = latestRevision.revid;

    if (!templates.length) {
      task.status = TaskStatus.SKIPPED;
    }

    task.sources = templates.map((template) =>
      this.sourcesService.create(template, content),
    );

    return task;
  }

  async create(...pages: ApiPage[]) {
    const tasks = pages.map((page) => this.createByPage(page));
    return this.tasksRepository.save(tasks);
  }

  async setDone(taskId: Task['id'], newRevId: ApiRevision['revid']) {
    const task = await this.tasksRepository.findOneOrFail(taskId);
    task.status = TaskStatus.DONE;
    task.newRevisionId = newRevId;
    return this.tasksRepository.save(task);
  }

  async setFailed(taskId: Task['id']) {
    const task = await this.tasksRepository.findOneOrFail(taskId);
    task.status = TaskStatus.FAILED;
    return this.tasksRepository.save(task);
  }

  async setReady(taskId: Task['id']) {
    const task = await this.tasksRepository.findOneOrFail(taskId);
    task.status = TaskStatus.READY_TO_DEPLOY;
    return this.tasksRepository.save(task);
  }
}
