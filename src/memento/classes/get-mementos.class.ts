import { Memento } from './memento.class';

export class GetMementosResponse {
  readonly timegate_uri: string;
  readonly timemap_uri: {
    json_format: string;
    link_format: string;
  };
  readonly mementos: {
    next?: Memento;
    last?: Memento;
    prev?: Memento;
    first?: Memento;
    closest?: Memento;
  };
  readonly original_uri: string;
}
