import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DateTime } from 'luxon';
import { MEMENTO_DATE_FORMAT } from '../memento.constants';
import { GetMementosResponse } from '../classes/get-mementos.class';

@Injectable()
export class MementoService {
  constructor(private httpService: HttpService) {}

  async get(uri: string, date: Date | string) {
    console.log('date', date);
    let datetime: string;

    if (typeof date === 'string') {
      datetime = DateTime.fromISO(date).toFormat(MEMENTO_DATE_FORMAT);
    } else {
      datetime = DateTime.fromJSDate(date).toFormat(MEMENTO_DATE_FORMAT);
    }

    const url = `/api/json/${datetime}/${uri}`;
    console.log('url', url);
    const { data } = await this.httpService.axiosRef.get<GetMementosResponse>(
      url,
    );
    return data;
  }
}
