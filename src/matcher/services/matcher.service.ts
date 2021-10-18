import { Injectable } from '@nestjs/common';
import { SourceStatus, Task, TaskStatus } from '@app/tasks';
import { ApiPage, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { MatcherQueue } from '../matcher.types';
import { InjectMatcherQueue } from '../matcher.decorators';

@Injectable()
export class MatcherService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot()
    private bot: mwn,
    private eventEmitter: EventEmitter2,
    @InjectMatcherQueue()
    private matcherQueue: MatcherQueue,
  ) {
    super(rootLogger);
  }

  async submit(...tasks: Task[]) {
    await this.matcherQueue.addBulk(
      tasks
        .filter((task) => task.status !== TaskStatus.SKIPPED)
        .map((task) => ({
          data: { task },
          opts: { jobId: `task_${task.id}` },
        })),
    );
  }
  
  protected async processPage(page: ApiPage) {
    const { revisions } = page;
    for (const revision of revisions) {
      const {
        slots: {
          // @ts-ignore
          main: { content, texthidden },
        },
      } = revision;
      if (texthidden) {
        continue;
      }

      const matchedSources = [];

      for (const source of sources) {
        // if url has been founded in revision content
        if (content.includes(source.url) && !source.revisionId) {
          source.status = SourceStatus.MATCHED;
          source.revisionId = revision.revid;
          source.revisionDate = new this.bot.date(revision.timestamp);

          // and push in matched source array for the event emitter
          matchedSources.push(source);
        }
      }

      if (matchedSources.length) {
        this.eventEmitter.emit('source.matched', {
          task,
          sources: matchedSources,
        });
      }
    }
  }

  async matchSources(task: Task) {
    const { sources, pageId, revisionId } = task;
    // iterate over the page revisions
    for await (const { query } of this.bot.continuedQueryGen({
      action: 'query',
      prop: 'revisions',
      pageids: pageId,
      rvdir: 'newer',
      rvendid: revisionId,
      rvslots: 'main',
      rvlimit: 'max',
      rvprop: ['ids', 'content', 'timestamp'],
    })) {
      const [pages] = query.pages as ApiPage[];
      this.processPage(pages);
    }
  }
}
