import get from 'lodash-es/get';
import merge from 'lodash-es/merge';
import set from 'lodash-es/set';
import unset from 'lodash-es/unset';

import YveBot from '.';

export interface IStoreData {
  currentIdx: number;
  waitingForAnswer: boolean;
  output: {
    [key: string]: any,
  };
}

export class Store {
  private bot: YveBot;
  private data: IStoreData;

  constructor(bot) {
    this.bot = bot;
    this.reset();
  }

  public output(): any {
    const output = this.get('output');
    return Object.assign({}, output);
  }

  public set(key: string, value: any): void {
    this.data = set(this.data, key, value);
    this.bot.dispatch('storeChanged', this.data);
  }

  public get(key?: string): any {
    return key ? get(this.data, key) : this.data;
  }

  public unset(key: string): void {
    const data = this.data;
    unset(data, key);
    this.data = data;
    this.bot.dispatch('storeChanged', this.data);
  }

  public reset(): void {
    this.data = {
      currentIdx: 0,
      output: {},
      waitingForAnswer: false,
    };
  }

  public replace(data: IStoreData): void {
    this.reset();
    this.data = merge({}, this.data, data);
  }
}
