import get from 'lodash-es/get';
import set from 'lodash-es/set';
import unset from 'lodash-es/unset';
import merge from 'lodash-es/merge';
import { YveBot } from './bot';

export type StoreData = {
  currentIdx: number,
  waitingForAnswer: boolean,
  output: {
    [key: string]: any,
  },
};

export class Store {
  private bot: YveBot;
  private data: StoreData;

  constructor(bot) {
    this.bot = bot;
    this.reset();
  }

  output(): any {
    const output = this.get('output');
    return Object.assign({}, output);
  }

  set(key: string, value: any): void {
    this.data = set(this.data, key, value);
    this.bot.dispatch('storeChanged', this.data);
  }

  get(key?: string): any {
    return key ? get(this.data, key) : this.data;
  }

  unset(key: string): void {
    const data = this.data;
    unset(data, key);
    this.data = data;
    this.bot.dispatch('storeChanged', this.data);
  }

  reset(): void {
    this.data = {
      currentIdx: 0,
      waitingForAnswer: false,
      output: {},
    };
  }

  replace(data: StoreData): void {
    this.reset();
    this.data = merge({}, this.data, data);
  }
}
