import { YveBotOptions, Rule, Flow, Answer, Context, EventName } from '../types';
import { Store, StoreData } from './store';
import { Controller } from './controller';
import { Actions } from './actions';
import { Types } from './types';
import { Executors } from './executors';
import { Validators } from './validators';

import * as Exceptions from './exceptions';

function sanitizeRule(rule: Rule): Rule {
  if (typeof rule === 'string') {
    return { message: rule };
  }
  if (['SingleChoice', 'MultipleChoice'].indexOf(rule.type) >= 0) {
    rule.options = (rule.options || []).map(o => {
      if (typeof o === 'string') {
        return { value: o };
      }
      if (typeof o.synonyms === 'string' && !!o.synonyms) {
        const synonyms: string = o.synonyms;
        o.synonyms = synonyms.split(',').map(s => s.trim());
      }
      return o;
    });
  }
  return rule;
}

function convertToRules(inputs: (Flow|Rule)[]): Rule[] {
  let rules: Rule[] = [];
  inputs.forEach(input => {
    const isFlow = typeof input !== 'string' && 'rules' in input && 'flow' in input;
    if (isFlow) {
      const flow = input as Flow;
      rules = rules.concat(
        flow.rules.map(
          rule => Object.assign({}, sanitizeRule(rule), {
            flow: input.flow,
          })
        )
      );
    } else {
      rules.push(sanitizeRule(input as Rule));
    }
  });
  return rules;
}

export class YveBot {
  static types: Types;
  static actions: Actions;
  static executors: Executors;
  static validators: Validators;
  static exceptions: any;

  private handlers: { [handler: string]: Array<() => any> };
  private _rules?: Rule[];

  public options: YveBotOptions;
  public rules: Rule[];
  public controller: Controller;
  public store: Store;
  public sessionId: string;

  constructor(rules: (Rule|Flow)[], customOpts?: YveBotOptions) {
    const DEFAULT_OPTS: YveBotOptions = {
      enableWaitForSleep: true,
      timePerChar: 40,
    };

    this.sessionId = 'session';
    this.options = Object.assign({}, DEFAULT_OPTS, customOpts);
    this.rules = convertToRules(rules);
    this.handlers = {};

    this.store = new Store(this);
    this.controller = new Controller(this);

    if (this.options.context) {
      this.store.set('context', this.options.context);
    }

    this.on('error', err => { throw err; });
  }

  public get context(): Context {
    return this.store.get('context');
  }

  public get types() { return YveBot.types; }
  public get actions() { return YveBot.actions; }
  public get executors() { return YveBot.executors; }
  public get validators() { return YveBot.validators; }

  on(evt: EventName, fn: (...args: any[]) => any): this {
    const isUniqueType = ['error'].indexOf(evt) >= 0;
    if (!isUniqueType && evt in this.handlers) {
      this.handlers[evt].push(fn);
    } else {
      this.handlers[evt] = [fn];
    }
    return this;
  }

  start(): this {
    this.dispatch('start');
    this.controller.run().catch(this.tryCatch.bind(this));
    return this;
  }

  end(): this {
    this.dispatch('end', this.store.output());
    return this;
  }

  talk(message: string, opts?: object): this {
    const rule = Object.assign({}, this.options.rule, opts || {});
    this.controller.sendMessage(message, rule);
    return this;
  }

  hear(answer: Answer | Answer[]): this {
    this.controller.receiveMessage(answer).catch(this.tryCatch.bind(this));
    return this;
  }

  dispatch(name: EventName, ...args) {
    if (name in this.handlers) {
      this.handlers[name].forEach(fn => fn(...args, this.sessionId));
    }
  }

  session(
    id: string,
    opts: { context?: Context, store?: StoreData, rules?: Rule[] } = {},
  ): this {
    this.sessionId = id;

    if (opts.rules) {
      this._rules = this.rules;
      this.rules = opts.rules.map(rule => sanitizeRule(rule));
    } else {
      this.rules = this._rules || this.rules;
    }

    if (opts.store) {
      this.store.replace(opts.store);
    } else {
      this.store.reset();
      this.controller.reindex();
    }

    if (opts.context) {
      this.store.set('context', opts.context);
    }

    return this;
  }

  private tryCatch(err: Error) {
    this.dispatch('error', err);
    this.end();
  }
}

YveBot.types = new Types;
YveBot.actions = new Actions;
YveBot.executors = new Executors;
YveBot.validators = new Validators;
YveBot.exceptions = Exceptions;
