export class EventCreator {
  protected readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  createEvent(event: string): string {
    return `${this.namespace}.${event}`;
  }
}
