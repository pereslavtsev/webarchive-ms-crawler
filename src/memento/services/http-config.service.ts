import { Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { stringify } from 'querystring';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: 'https://timetravel.mementoweb.org',
      timeout: 60 * 1000,
      paramsSerializer(p) {
        return stringify(p);
      },
    };
  }
}
