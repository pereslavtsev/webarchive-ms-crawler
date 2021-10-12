import { ApiParams } from 'mwn';

export const CITE_WEB_WATCHER_PARAMS: ApiParams = {
  action: 'query',
  titles: 'Шаблон:cite web',
  generator: 'transcludedin',
  //gtilimit: '10',
  gtinamespace: 0,
  prop: 'revisions',
  rvslots: 'main',
  rvprop: ['ids', 'content'],
};

export const CITE_NEWS_WATCHER_PARAMS: ApiParams = {
  action: 'query',
  titles: 'Шаблон:cite news',
  generator: 'transcludedin',
  //gtilimit: '10',
  gtinamespace: 0,
  prop: 'revisions',
  rvslots: 'main',
  rvprop: ['ids', 'content'],
};
