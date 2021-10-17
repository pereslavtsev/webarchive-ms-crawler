import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import { MEMENTO_DATE_FORMAT } from '../memento.constants';
import { GetMementosResponse } from '../classes/get-mementos.class';
import type { AxiosRequestConfig } from 'axios';
import { CoreProvider } from '@app/core';
import { Bunyan, RootLogger } from '@eropple/nestjs-bunyan';
import parse from 'url-parse';

@Injectable()
export class MementoService extends CoreProvider {
  constructor(
    @RootLogger() rootLogger: Bunyan,
    private httpService: HttpService,
  ) {
    super(rootLogger);
    this.httpService.axiosRef.interceptors.request.use(
      this.onRequest.bind(this),
    );
  }

  protected onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    this.log.debug(`request to: ${config.baseURL}${config.url}`);
    return config;
  }

  async get(uri: string, date: Date | string) {
    const parsedUrl = parse(uri);

    if (!parsedUrl.protocol) {
      parsedUrl.set('protocol', 'http'); // try to use http
      parsedUrl.set('slashes', false);
    }

    let datetime: string;

    if (typeof date === 'string') {
      datetime = DateTime.fromISO(date).toFormat(MEMENTO_DATE_FORMAT);
    } else {
      datetime = DateTime.fromJSDate(date).toFormat(MEMENTO_DATE_FORMAT);
    }

    const url = `/api/json/${datetime}/${parsedUrl.toString()}`;
    const { data } = await this.httpService.axiosRef.get<GetMementosResponse>(
      url,
    );
    return data;
  }
}
