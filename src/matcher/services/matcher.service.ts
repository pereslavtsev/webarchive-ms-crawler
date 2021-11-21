import { Injectable } from '@nestjs/common';
import { ApiPage, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { Task } from '@core/tasks';
import { isMainThread, parentPort, Worker } from 'worker_threads';
import { Source, SourcesService } from '@core/sources';
import { processorPath } from '@core/matcher/matcher.constants';
import { InjectMatcherQueue } from '../matcher.decorators';
import type { MatcherQueue } from '../matcher.types';

@Injectable()
export class MatcherService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot()
    private bot: mwn,
    @InjectMatcherQueue()
    private matcherQueue: MatcherQueue,
    private sourcesService: SourcesService,
  ) {
    super(rootLogger);
  }

  async match(task: Task): Promise<void> {
    if (isMainThread) {
      const worker = new Worker(processorPath, {
        workerData: { task },
        execArgv: [...process.execArgv, '--unhandled-rejections=strict'],
      });

      let matched = 0;

      return new Promise((resolve, reject) => {
        worker
          .on('message', async (message) => {
            switch (message.cmd) {
              case 'matched': {
                const { revision } = message.data;
                await this.sourcesService.updateById(message.sourceId, {
                  revisionId: revision.revid,
                  revisionDate: new this.bot.date(revision.timestamp),
                });
                await this.sourcesService.setMatched(message.sourceId);
                matched++;
                const unmatchedPercents = (
                  (matched / task.sources.length) *
                  100
                ).toFixed(0);
                const job = await this.matcherQueue.getJob(task.id);
                await job.progress(Number(unmatchedPercents));
                return;
              }
            }
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('exit', () => {
            resolve();
          });
      });
    } else {
      const log = this.log.child({ reqId: task.id });
      const { pageId, revisionId, sources } = task;

      const sourcesMap = new Map<Source['url'], Source>();

      sources.forEach((source) => sourcesMap.set(source.url, source));

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
        log.debug('received', query.pages[0].revisions.length);
        const [page] = query.pages as ApiPage[];
        const { revisions } = page;

        for (const revision of revisions) {
          const {
            slots: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              main: { content, texthidden },
            },
          } = revision;
          if (texthidden) {
            continue;
          }

          for (const source of sourcesMap.values()) {
            if (content.includes(source.url)) {
              //console.log(source.url, revision.timestamp);

              sourcesMap.delete(source.url);

              parentPort.postMessage({
                cmd: 'matched',
                sourceId: source.id,
                data: { revision },
              });

              if (!sourcesMap.size) {
                return;
              }
            }
          }
        }

        // parentPort.postMessage({
        //   cmd: 'data',
        //   watcherId: id,
        //   data: json,
        // });
      }
    }
  }
}
