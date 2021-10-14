import { Injectable } from '@nestjs/common';
import { ApiPage, mwn } from 'mwn';
import { InjectTasksRepository, Task, TaskStatus } from '@app/tasks';
import { SourcesService } from './sources.service';
import { InjectBot } from 'nest-mwn';
import { CiteTemplatesService } from '@app/cite-templates';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectBot()
    private bot: mwn,
    private citeTemplatesService: CiteTemplatesService,
    private sourcesService: SourcesService,
    @InjectTasksRepository()
    private tasksRepository: Repository<Task>,
  ) {}

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
      this.sourcesService.create(template),
    );

    return task;
  }

  async create(...pages: ApiPage[]) {
    const tasks = pages.map((page) => this.createByPage(page));
    await this.tasksRepository.save(tasks);
  }
}
