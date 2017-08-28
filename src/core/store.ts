import { get, set } from 'lodash';

type StoreData = {
  currentIdx: number,
  waitingForAnswer: boolean,
  indexes: {
    [name: string]: number,
  },
  output: {
    [key: string]: any,
  },
};

export class Store {
  private data: StoreData;
  private onUpdate: (Object) => void;

  constructor(onUpdate: (output: Object) => any) {
    this.data = {
      currentIdx: null,
      waitingForAnswer: false,
      indexes: {},
      output: {},
    };
    this.onUpdate = onUpdate;
  }

  output(): any {
    const output = this.get('output');
    return Object.assign({}, output);
  }

  set(key: string, value: any): void {
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
