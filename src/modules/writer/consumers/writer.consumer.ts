import {
  OnQueueDrained,
  Processor,
  Process,
  OnQueueFailed,
} from '@nestjs/bull';
import { InjectBot } from 'nest-mwn';
import { ApiRevision, mwn } from 'mwn';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { DateTime } from 'luxon';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { WRITER_QUEUE } from '../writer.constants';
import { Job } from 'bull';
import { Task, TasksService } from '@core/tasks';
import { MatcherJob } from '@core/matcher/matcher.types';
import { PythonShell } from 'python-shell';
import { join } from 'path';
import { Source } from '@core/sources';

async function addParam(
  wikitext: string,
  param: string,
  value: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      join(__dirname, 'add_param.py'),
      {
        args: [wikitext, param, value],
      },
      (err, results) => {
        if (err) {
          reject(err);
        }
        const [wkt] = results;
        resolve(wkt);
      },
    );
  });
}

@Processor(WRITER_QUEUE)
export class WriterConsumer extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private readonly bot: mwn,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  @OnQueueDrained()
  handleDrained() {
    //this.log.info(`"${WRITER_QUEUE}" queue has been drained`);
  }

  @OnQueueFailed()
  handleFailed(job: MatcherJob, error: Error) {
    const log = this.log.child({ reqId: job.id });
    log.error(error);
  }

  @Process()
  async write(job: Job<Task>) {
    const log = this.log.child({ reqId: job.id });
    const { data: task } = job;
    const { pageId, sources } = task;

    const { query } = await this.bot.query({
      action: 'query',
      pageids: [pageId],
      prop: 'revisions',
      rvslots: 'main',
      rvprop: ['ids', 'content'],
    });
    const [page] = query.pages;
    const [latestRevision]: ApiRevision[] = page.revisions;
    const {
      revid,
      slots: {
        main: { content },
      },
    } = latestRevision;

    if (Number(task.revisionId) !== Number(revid)) {
      // TODO: handle
      log.warn('page was updated');
    }

    let currentContent = content.slice();

    const archivedSources = sources.filter(
      (source) => source.status === Source.Status.ARCHIVED,
    );

    log.debug(
      `Writing a ${archivedSources.length} archived sources (total: ${sources.length}) page "${page.title}"`,
    );

    for (const source of archivedSources) {
      const { template, wikitext, archiveUrl, archiveDate } = source;
      const { archiveUrlParam, archiveDateParam } = template;

      let updated = await addParam(wikitext, archiveUrlParam, archiveUrl);

      if (archiveDateParam) {
        const date = DateTime.fromISO(
          archiveDate as unknown as string,
        ).toISODate();
        updated = await addParam(updated, archiveDateParam, date);
      }

      currentContent = currentContent.replace(wikitext, updated);
    }

    if (content === currentContent) {
      log.warn('content are identical, skipped...');
      return;
    }

    const editResponse = await this.bot.save(
      page.title,
      currentContent,
      `Архивировано источников: ${archivedSources.length}`,
      {
        minor: true,
      },
    );
    log.info(
      editResponse,
      `page "${page.title}" has been written, ${archivedSources.length} was archived`,
    );

    if (editResponse.nochange) {
      log.warn('no changes');
    }

    await this.tasksService.setDone(task.id, editResponse.newrevid);
  }
}
