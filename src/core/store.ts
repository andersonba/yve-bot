import { get, set } from 'lodash';

type StoreData = {
  sessionId?: string;
  context: Object;
};

export class Store {
  private data: StoreData;
  private onUpdate: (Object) => void;

  constructor(
    context: Object,
    onUpdate: (output: Object) => any,
  ) {
    this.data = { context };
    this.onUpdate = onUpdate;
  }

  output(): any {
    const output = this.get('output');
    const context = this.get('context');
    return Object.assign({}, output, context);
  }

  update(key: string, value: any): void {
    const copy = Object.assign({}, this.get());
    this.data = set(copy, key, value);
    if (/output\./.test(key) && this.onUpdate) {
      this.onUpdate(this.output());
    }
  }

  get(key?: string): any {
    return key ? get(this.data, key) : this.data;
  }
}
