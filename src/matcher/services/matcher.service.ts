import { Injectable } from '@nestjs/common';
import { SourceStatus, Task } from '@app/tasks';
import { ApiPage, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatcherService {
  constructor(
    @InjectBot()
    private bot: mwn,
    private eventEmitter: EventEmitter2,
  ) {}

  async matchSources({ sources, pageId, revisionId }: Task) {
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
      const [{ revisions }] = query.pages as ApiPage[];
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
          this.eventEmitter.emit('source.matched', matchedSources);
        }
      }
    }
  }
}
