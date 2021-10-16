import { Process, Processor } from '@nestjs/bull';
import { InjectBot } from 'nest-mwn';
import { ApiRevision, mwn } from 'mwn';
import type { Job } from 'bull';
import { CiteTemplatesService } from '@app/cite-templates';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';

import { SourceStatus } from '../enums';
import { TasksService } from '../services';
import { Task } from '../models';
import { WRITER_QUEUE } from '../tasks.constants';
import { DateTime } from 'luxon';

@Processor(WRITER_QUEUE)
export class WriterConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private taskService: TasksService,
    private citeTemplatesService: CiteTemplatesService,
    @InjectBot() private readonly bot: mwn,
  ) {
    super(rootLogger);
  }

  @Process()
  async write(job: Job<Task>) {
    try {
      const log = this.log.child({ reqId: job.id });
      const task = job.data;
      const { query } = await this.bot.query({
        action: 'query',
        pageids: [job.data.pageId],
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

      const checkedSources = task.sources.filter(
        (source) => source.status === SourceStatus.CHECKED,
      );

      if (!checkedSources.length) {
        this.log.error('no checked sources has been found');
        return;
      }

      let currentContent = content;

      checkedSources.forEach((source) => {
        const oldWikitext = source.templateWikitext.slice();
        const archiveDate = DateTime.fromISO(
          source.archiveDate as unknown as string,
        ).toISODate();
        const { archiveUrlParam, archiveDateParam } =
          this.citeTemplatesService.findByName(source.templateName);
        source.templateWikitext = source.templateWikitext.replace(
          /}}/,
          `|${archiveUrlParam}=${source.archiveUrl}|${archiveDateParam}=${archiveDate}}}`,
        );
        currentContent = currentContent.replace(
          oldWikitext,
          source.templateWikitext,
        );
      });

      //console.log('currentContent', currentContent);

      log.info(
        `page "${task.pageTitle}" has been written, ${checkedSources.length} was archived`,
      );
      // const res = await this.bot.save(
      //   task.pageTitle,
      //   currentContent,
      //   `Архивировано источников: ${archivedSources.length}`,
      //   {
      //     minor: true,
      //   },
      // );
      // console.log('res', res);
      // if (res.result === 'Success') {
      //   await this.taskService.update(task.id, {
      //     status: TaskStatus.COMPLETED,
      //   });
      // } else {
      //   console.log('error res', res);
      // }
      await job.queue.pause();
      console.log('paused');
    } catch (error) {
      console.log('error', error);
    }
  }
}
