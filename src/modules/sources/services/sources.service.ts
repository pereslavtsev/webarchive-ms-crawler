import { Injectable } from '@nestjs/common';
import { Source } from '../models';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { LoggableProvider } from '@pereslavtsev/webarchiver-misc';
import { InjectSourcesRepository } from '../sources.decorators';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Task } from '@core/tasks';
import { plainToClass } from 'class-transformer';
import { ArchiveSourceDto } from '../dto';

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

  async findById(sourceId: Source['id']): Promise<Source> {
    const source = await this.sourcesRepository.findOneOrFail(sourceId);
    return plainToClass(Source, source);
  }

  async findByTaskId(taskId: Task['id']): Promise<Source[]> {
    const sources = await this.sourcesRepository.find({
      where: {
        task: {
          id: taskId,
        },
      },
    });
    return plainToClass(Source, sources);
  }

  async updateById(
    sourceId: Source['id'],
    data: Partial<Source>,
  ): Promise<Source> {
    const source = await this.findById(sourceId);
    const updatedSource = await this.sourcesRepository.save({
      ...source,
      ...data,
    });
    return plainToClass(Source, updatedSource);
  }

  async archive(
    sourceId: Source['id'],
    data: Omit<ArchiveSourceDto, 'id'>,
  ): Promise<Source> {
    const source = await this.updateById(sourceId, {
      ...data,
      status: Source.Status.ARCHIVED,
    });
    this.eventEmitter.emit('source.archived', source);
    return source;
  }

  protected async setStatus(
    sourceId: Source['id'],
    status: Source['status'],
  ): Promise<Source> {
    const source = await this.findById(sourceId);
    const updatedSource = await this.sourcesRepository.save({
      ...source,
      status,
    });
    return plainToClass(Source, updatedSource);
  }

  async setMatched(sourceId: Source['id']): Promise<Source> {
    const source = await this.setStatus(sourceId, Source.Status.MATCHED);
    this.eventEmitter.emit('source.matched', source);
    return source;
  }

  async discard(sourceId: Source['id']): Promise<Source> {
    const source = await this.setStatus(sourceId, Source.Status.DISCARDED);
    this.eventEmitter.emit('source.discarded', source);
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
