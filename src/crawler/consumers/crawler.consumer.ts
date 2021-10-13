import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnQueueProgress } from '@nestjs/bull';
import { Job } from 'bull';
import { ApiPage, mwn } from 'mwn';
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nest-mwn';
import { TaskStatus, InjectTasksRepository, Source, Task } from '@app/tasks';
import { Repository } from 'typeorm';
import { CiteTemplatesService } from '@app/cite-templates';

@Injectable()
export class CrawlerConsumer {
  constructor(
    @InjectBot()
    private bot: mwn,
    private eventEmitter: EventEmitter2,
    @InjectTasksRepository()
    private tasksRepository: Repository<Task>,
    private citeTemplatesService: CiteTemplatesService,
  ) {}

  @OnQueueProgress()
  async progress(job: Job, pages: ApiPage[]) {
    console.log('xxx', ...pages.map((p) => p.title));
    const tasks = pages.map((page) => {
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
          const hasUrl = this.citeTemplatesService.hasUrl(template);
          return !archived && hasUrl;
        },
      });

      const task = new Task();
      task.pageId = page.pageid;
      task.pageTitle = page.title;
      task.revisionId = latestRevision.revid;

      if (!templates.length) {
        task.status = TaskStatus.SKIPPED;
      }

      task.sources = templates.map((template) => {
        const source = new Source();
        source.url = template.getValue('url');
        if (!source.url) {
          console.warn(template.wikitext);
        }
        source.title = template.getValue('title');
        source.templateName = String(template.name).toLowerCase();
        source.templateWikitext = template.wikitext;
        return source;
      });

      return task;
    });

    await this.tasksRepository.save(tasks);

    // pages.forEach((page) =>
    //   this.eventEmitter.emit('page.received', {
    //     data: page,
    //   } as PageReceivedEvent),
    // );
  }
}
