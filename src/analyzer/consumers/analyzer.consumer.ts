import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Process,
  Processor,
  OnQueueActive,
  OnQueueFailed,
  OnQueueCompleted,
} from '@nestjs/bull';
import { ANALYZER_QUEUE } from '../analyzer.constants';
import type { AnalyzerJob } from '../analyzer.types';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { InjectBot } from 'nest-mwn';
import { ApiPage, mwn } from 'mwn';
import { TemplatesService, Template } from '@core/templates';
import { Task, TasksService } from "@core/tasks";
import { Source } from '@core/sources';

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

@Processor(ANALYZER_QUEUE)
export class AnalyzerConsumer extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectBot() private readonly bot: mwn,
    private templatesService: TemplatesService,
    private tasksService: TasksService,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  @Process({ concurrency: 10 })
  async analyze(job: AnalyzerJob) {
    const {
      data: { task },
    } = job;

    const { query } = await this.bot.query({
      action: 'query',
      prop: 'revisions',
      rvprop: 'ids|content|tags',
      rvslots: 'main',
      pageids: [task.pageId],
    });

    const [page] = query.pages as ApiPage[];
    const [revision] = page.revisions;

    const {
      slots: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        main: { content, texthidden },
      },
    } = revision;

    if (texthidden) {
      // TODO: skip
    }

    const wkt = new this.bot.wikitext(content);

    const templates = await this.templatesService.findAll();

    const templatesMap = new Map<string, Template>();
    templates.forEach((template) => {
      templatesMap.set(template.title, template);
      template.aliases?.forEach((alias) => templatesMap.set(alias, template));
    });

    const sourceTemplates = wkt.parseTemplates({
      templatePredicate: (template) => {
        const name = String(template.name).toLowerCase();

        if (!templatesMap.has(name)) {
          return false;
        }

        const { settings } = templatesMap.get(name);

        const { defaultUrlParam, urlParamAliases } = settings;
        const url = [defaultUrlParam, ...urlParamAliases]
          .map((param) => template.getValue(param))
          .find((value) => !!value);

        if (!url) {
          return false;
        }

        const { archiveUrlParam, archiveParamAliases } = settings;
        const isArchived = [archiveUrlParam, ...archiveParamAliases].some(
          (param) => !!template.getValue(param),
        );

        return !isArchived;
      },
    });

    const sources = sourceTemplates.map((sourceTemplate) => {
      const template = templatesMap.get(
        String(sourceTemplate.name).toLowerCase(),
      );
      const { settings } = template;

      const { defaultUrlParam, urlParamAliases } = settings;
      const url = [defaultUrlParam, ...urlParamAliases]
        .map((param) => sourceTemplate.getValue(param))
        .find((value) => !!value);

      const { titleParam, titleParamAliases } = settings;
      const title = [titleParam, ...titleParamAliases]
        .map((param) => sourceTemplate.getValue(param))
        .find((value) => !!value);

      const source = new Source() as Writable<Source>;
      source.url = url;
      source.title = title;
      source.template = template;
      source.wikitext = sourceTemplate.wikitext;
      return source;
    });

    if (!sources.length) {
      await this.tasksService.setSkipped(task.id);
      await job.discard();
      return;
    }

    return this.tasksService.addSources(task.id, revision.revid, sources);
  }

  @OnQueueActive()
  handleStarted(job: AnalyzerJob) {}

  @OnQueueCompleted()
  async handleCompleted(job: AnalyzerJob, task: Task) {
    const log = this.log.child({ reqId: job.id });
    log.debug('sources added', task.sources?.length || 0);
    await this.tasksService.setAccepted(task.id);
  }

  @OnQueueFailed()
  async handleFailed(job: AnalyzerJob, error: Error) {
    const log = this.log.child({ reqId: job.id });
    log.error(error);

    try {
      const {
        data: { task },
      } = job;
      await this.tasksService.setFailed(task.id);
    } catch (error) {
      log.error(error);
    }
  }
}
