import { Injectable } from '@nestjs/common';
import { Source } from '../models';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { InjectSourcesRepository } from '../sources.decorators';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SourcesService extends LoggableProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<Source>,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  findById(sourceId: Source['id']): Promise<Source> {
    return this.sourcesRepository.findOneOrFail(sourceId);
  }

  async updateById(
    sourceId: Source['id'],
    data: Partial<Source>,
  ): Promise<Source> {
    const source = await this.findById(sourceId);
    return this.sourcesRepository.save({ ...source, ...data });
  }

  protected async setStatus(
    sourceId: Source['id'],
    status: Source['status'],
  ): Promise<Source> {
    const source = await this.findById(sourceId);
    return this.sourcesRepository.save({ ...source, status });
  }

  async setMatched(sourceId: Source['id']): Promise<Source> {
    const source = await this.setStatus(sourceId, Source.Status.MATCHED);
    this.eventEmitter.emit('source.matched');
    return source;
  }

  // create(template: Template, content: string): Source {
  //   const source = new Source();
  //   source.url = this.citeTemplatesService.getUrlValue(template);
  //   source.title = template.getValue('title');
  //   source.templateName = String(template.name).toLowerCase();
  //   source.templateWikitext = template.wikitext;
  //   source.dead = this.citeTemplatesService.isDead(template, content);
  //   return source;
  // }
}
