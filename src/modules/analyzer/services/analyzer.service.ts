import { Injectable } from '@nestjs/common';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { ApiPage, mwn } from 'mwn';
import { InjectBot } from 'nest-mwn';
import { Template, TemplatesService } from '@core/templates';
import { Task, TasksService } from '@core/tasks';
import { Source } from '@core/sources';

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

@Injectable()
export class AnalyzerService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private templatesService: TemplatesService,
    @InjectBot() private readonly bot: mwn,
    private tasksService: TasksService,
  ) {
    super(rootLogger);
  }

  async analyze(task: Task) {
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

        const { defaultUrlParam, urlParamAliases } = templatesMap.get(name);
        const url = [defaultUrlParam, ...urlParamAliases]
          .map((param) => template.getValue(param))
          .find((value) => !!value);

        if (!url) {
          return false;
        }

        const { archiveUrlParam, archiveUrlParamAliases } =
          templatesMap.get(name);
        const isArchived = [archiveUrlParam, ...archiveUrlParamAliases].some(
          (param) => !!template.getValue(param),
        );

        return !isArchived;
      },
    });

    const sources = sourceTemplates.map((sourceTemplate) => {
      const template = templatesMap.get(
        String(sourceTemplate.name).toLowerCase(),
      );

      const { defaultUrlParam, urlParamAliases } = template;
      const url = [defaultUrlParam, ...urlParamAliases]
        .map((param) => sourceTemplate.getValue(param))
        .find((value) => !!value);

      const { titleParam, titleParamAliases } = template;
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
      return this.tasksService.setSkipped(task.id);
    }

    return this.tasksService.addSources(task.id, revision.revid, sources);
  }
}
