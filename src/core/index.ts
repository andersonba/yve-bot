import PQueue from 'promise-queue/lib';
import {
  Answer,
  EventName,
  IContext,
  IFlow,
  IListener,
  IRule,
  IYveBotOptions,
} from '../types';
import { Actions } from './actions';
import { Controller } from './controller';
import * as Exceptions from './exceptions';
import { Listeners } from './listeners';
import { sanitizeBotRules, sanitizeListener, sanitizeRule } from './sanitizers';
import { IStoreData, Store } from './store';
import { Types } from './types';
import { Validators } from './validators';

export default class YveBot {
  public static types: Types;
  public static actions: Actions;
  public static listeners: Listeners;
  public static validators: Validators;
  public static exceptions: any;

  public options: IYveBotOptions;
  public rules: IRule[];
  public controller: Controller;
  public store: Store;
  public sessionId: string;

  private handlers: { [handler: string]: Array<(...args) => any> };
  private queue: { add: (fn: () => Promise<any>) => void };

  constructor(rules: Array<IRule | IFlow>, customOpts?: IYveBotOptions) {
    const DEFAULT_OPTS: IYveBotOptions = {
      enableWaitForSleep: true,
      timePerChar: 40,
    };

    this.sessionId = 'session';
    this.options = { ...DEFAULT_OPTS, ...customOpts };
    this.rules = sanitizeBotRules(rules);
    this.handlers = {};

    this.store = new Store(this);
    this.controller = new Controller(this);
    this.queue = new PQueue(1);

    if (this.options.context) {
      this.store.set('context', this.options.context);
    }

    this.on('error', err => {
      /* istanbul ignore next */
      throw err;
    });
  }

  public get context(): IContext {
    return this.store.get('context');
  }

  public get types() {
    return YveBot.types;
  }
  public get actions() {
    return YveBot.actions;
  }
  public get listeners() {
    return YveBot.listeners;
  }
  public get validators() {
    return YveBot.validators;
  }
  public get exceptions() {
    return YveBot.exceptions;
  }

  public on(evt: EventName, fn: (...args: any[]) => any): this {
    const isUniqueType = ['error'].indexOf(evt) >= 0;
    if (!isUniqueType && evt in this.handlers) {
      this.handlers[evt].push(fn);
    } else {
      this.handlers[evt] = [fn];
    }
    return this;
  }

  public listen(listeners: IListener[]): this {
    this.on('listen', (message, rule) => {
      listeners.every(item => {
        const listener = sanitizeListener(item);
        const ignorePassive =
          !listener.passive &&
          ['Passive', 'PassiveLoop'].indexOf(rule.type) < 0;
        const ignoreRule = !rule.passive;
        if (!listener.next || ignorePassive || ignoreRule) {
          return true;
        }
        const [key] = Object.keys(listener).filter(
          k => k !== 'next' && k in this.listeners
        );
        if (key) {
          const result = this.listeners[key](listener[key], message);
          if (result) {
            this.store.set('waitingForAnswer', false);
            this.controller.jumpByName(listener.next);
            return false;
          }
        }
        return true;
      });
    });
    return this;
  }

  public start(): this {
    this.dispatch('start');
    if (!this.store.get('waitingForAnswer')) {
      const idx = this.store.get('currentIdx') || 0;
      this.controller.run(idx);
    }
    return this;
  }

  public end(): this {
    this.dispatch('end', this.store.output());
    return this;
  }

  public async talk(message: string, opts?: object): Promise<this> {
    const rule = { ...this.options.rule, ...(opts || {}) };
    await this.controller.sendMessage(message, rule);
    return this;
  }

  public async hear(answer: Answer | Answer[]): Promise<this> {
    await this.controller.receiveMessage(answer);
    this.dispatch('reply', answer);
    return this;
  }

  public dispatch(name: EventName, ...args): this {
    if (name in this.handlers) {
      if (name === 'error') {
        this.handlers.error.map(fn => fn(...args, this.sessionId));
        return;
      }

      Promise.all(
        this.handlers[name].map(fn =>
          this.queue.add(() => {
            try {
              return Promise.resolve(fn(...args, this.sessionId));
            } catch (err) {
              this.dispatch('error', err);
              return Promise.resolve();
            }
          })
        )
      );
    }

    return this;
  }

  public session(
    id: string,
    opts: { context?: IContext; store?: IStoreData; rules?: IRule[] } = {}
  ): this {
    if (opts.rules) {
      this.rules = opts.rules.map(sanitizeRule);
      this.controller.reindex();
    }

    if (opts.store) {
      this.store.replace(opts.store);
    } else if (this.sessionId !== id) {
      this.store.reset();
    }

    if (opts.context) {
      this.store.set('context', opts.context);
    }

    this.sessionId = id;

    return this;
  }

  public addRules(rules: Array<IRule | IFlow>) {
    this.rules = this.rules.concat(rules.map(sanitizeRule));
    this.controller.reindex();
  }
}

YveBot.types = new Types();
YveBot.actions = new Actions();
YveBot.listeners = new Listeners();
YveBot.validators = new Validators();
YveBot.exceptions = Exceptions;
