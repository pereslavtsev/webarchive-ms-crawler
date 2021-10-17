import { Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import { ArchiverService } from '@app/archiver';
import { AnalyzerService } from '@app/analyzer';
import { Queue } from 'bull';

import {
  InjectSourcesRepository,
  InjectWriterQueue,
  OnSourceArchived,
  OnSourceChecked,
  OnSourceFailed,
  OnSourceMatched,
} from '../tasks.decorators';
import { SourceStatus } from '../enums';
import type {
  SourceArchivedEvent,
  SourceCheckedEvent,
  SourcesMatchedEvent,
} from '../events';
import type { Source } from '../models';
import { Task } from '../models';
import { TasksService } from '../services';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SourceListener extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    @InjectWriterQueue()
    private writerQueue: Queue<Task>,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<Source>,
    private analyzerService: AnalyzerService,
    private archiverService: ArchiverService,
    private tasksService: TasksService,
    private eventEmitter: EventEmitter2,
  ) {
    super(rootLogger);
  }

  @OnSourceMatched()
  async handleSourcesMatchedEvent({ sources, task }: SourcesMatchedEvent) {
    const updatedSources = await this.sourcesRepository.save(sources);
    await this.archiverService.submit(task, updatedSources);
  }

  @OnSourceArchived()
  async handleSourceArchived({ source, task }: SourceArchivedEvent) {
    source.status = SourceStatus.ARCHIVED;
    const updatedSource = await this.sourcesRepository.save(source);
    await this.analyzerService.submit(task, updatedSource);
  }

  @OnSourceFailed()
  async handleSourceFailed({ source, task }: SourceArchivedEvent) {
    source.status = SourceStatus.FAILED;
    await this.sourcesRepository.save(source);
    this.eventEmitter.emit('source.processed', { task });
  }

  @OnEvent('source.processed')
  async handleSourceProcessed({ task }) {
    const unchecked = await this.sourcesRepository.count({
      where: {
        task,
        status: Not(
          In([
            SourceStatus.CHECKED,
            SourceStatus.FAILED,
            SourceStatus.UNVERIFIABLE,
          ]),
        ),
      },
    });
    this.log.debug(
      `${unchecked}/${task.sources.length} unchecked sources for page "${task.pageTitle}"`,
    );
    if (!unchecked) {
      const checked = await this.sourcesRepository.count({
        where: {
          task,
          status: SourceStatus.CHECKED,
        },
      });
      if (!checked) {
        this.log.error('no checked sources has been found, set as failed');
        await this.tasksService.setFailed(task.id);
        return;
      }
      try {
        const updatedTask = await this.tasksService.setReady(task.id);
        await this.writerQueue.add(updatedTask, { jobId: `task_${task.id}` });
      } catch (error) {
        this.log.error(error, task);
      }
    }
  }

  @OnEvent('source.unverifiable')
  async handleSourceUnverifiable({ source, task }) {
    source.status = SourceStatus.UNVERIFIABLE;
    await this.sourcesRepository.save(source);
    this.eventEmitter.emit('source.processed', { task });
  }

  @OnSourceChecked()
  async handleSourceChecked({ source, task }: SourceCheckedEvent) {
    const checkedMemento = source.mementos.find((memento) => memento.checked);
    source.status = SourceStatus.CHECKED;
    source.archiveUrl = checkedMemento.uri;
    source.archiveDate = checkedMemento.archivedDate;
    await this.sourcesRepository.save(source);
    this.eventEmitter.emit('source.processed', { task });
    // console.log('unchecked', task.pageTitle, unchecked);
  }
}
