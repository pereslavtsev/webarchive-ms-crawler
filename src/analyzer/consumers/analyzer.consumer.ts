import { CoreProvider } from "@app/core";
import { Bunyan, RootLogger } from "@eropple/nestjs-bunyan";
import { Process, Processor } from "@nestjs/bull";
import { ANALYZER_QUEUE } from "../analyzer.constants";
import type { AnalyzerJob } from "../analyzer.types";
import { HttpService } from "@nestjs/axios";
import type { Memento } from "@app/tasks/models/memento.model";
import { Repository } from "typeorm";
import { InjectMementosRepository, InjectSourcesRepository, Source, SourceStatus } from "@app/tasks";

@Processor(ANALYZER_QUEUE)
export class AnalyzerConsumer extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private httpService: HttpService,
    @InjectSourcesRepository()
    private sourcesRepository: Repository<Source>,
    @InjectMementosRepository()
    private mementoRepository: Repository<Memento>,
  ) {
    super(rootLogger);
  }

  async check(title: string, memento: Memento): Promise<boolean> {
    const { data } = await this.httpService.axiosRef.get<string>(memento.uri);
    const res = data.match(new RegExp(title, 'ig'));
    if (!res) {
      this.log.error('Finding "' + title + '" in ' + memento.uri);
    }
    return !!res;
  }

  @Process({ concurrency: 5 })
  async analyze(job: AnalyzerJob) {
    try {
      const { source, task } = job.data;
      const { mementos } = source;
      for (const memento of mementos) {
        const checked = await this.check(task.pageTitle, memento);
        if (checked) {
          memento.checked = true;
          await this.mementoRepository.save(memento);
          source.status = SourceStatus.CHECKED;
          await this.sourcesRepository.save(source);
          return;
        }
      }
    } catch (error) {
      this.log.error(error);
    }
  }
}
