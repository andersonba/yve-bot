import uniq from 'lodash-es/uniq';

import {
  Answer,
  IModuleOptions,
  IRule,
  IRuleType,
  IRuleTypeExecutor,
} from '../types';
import { DefineModule } from './module';
import { sanitizeRuleType } from './sanitizers';
import * as utils from './utils';

const types: { [name: string]: IRuleTypeExecutor } = {
  Any: {},

  Passive: {},

  PassiveLoop: {},

  String: {
    transform: async (value: Answer) => String(value),
  },

  Number: {
    transform: async (value: Answer) => Number(value),
    validators: [
      {
        number: true,
        warning: 'Invalid number',
      },
    ],
  },

  SingleChoice: {
    transform: async (value: Answer | Answer[], rule: IRule) => {
      const option = utils.findOptionByAnswer(rule.options, value);
      if (!option) {
        return undefined;
      }
      return option.value === undefined ? option.label : option.value;
    },
    validators: [
      {
        function: (answer: Answer | Answer[], rule: IRule) =>
          !!utils.findOptionByAnswer(rule.options, answer),
        warning: 'Unknown option',
      },
    ],
    requiredMessage: (rule: IRule) => !rule.options.length,
  },

  MultipleChoice: {
    transform: async (answer: Answer | Answer[], rule: IRule) => {
      let values;
      if (answer instanceof Array) {
        values = answer;
      } else {
        let options = [];
        rule.options.forEach(o => {
          options.push(String(o.value || o.label));
          if (o.synonyms) {
            options = options.concat(o.synonyms);
          }
        });
        values = utils.identifyAnswersInString(String(answer), options);
      }
      return uniq(
        values
          .map(value => {
            const option = utils.findOptionByAnswer(rule.options, value);
            if (!option) {
              return undefined;
            }
            return option.value === undefined ? option.label : option.value;
          })
          .filter(x => x !== undefined)
      );
    },
    validators: [
      {
        function: (answer: Answer | Answer[], rule: IRule) => {
          const answers = utils.ensureArray(answer);
          const options = rule.options.map(o => String(o.value || o.label));
          return answers.every(a =>
            options.some(o => utils.isMatchAnswer(a, o))
          );
        },
        warning: 'Unknown options',
      },
    ],
    requiredMessage: (rule: IRule) => !rule.options.length,
  },
};

export class Types extends DefineModule {
  public Any: IRuleType;
  public Passive: IRuleType;
  public PassiveLoop: IRuleType;
  public String: IRuleType;
  public Number: IRuleType;
  public SingleChoice: IRuleType;
  public MultipleChoice: IRuleType;
  public StringSearch: IRuleType;

  constructor() {
    super('types');

    const sanitized = {};
    for (const k in types) {
      /* istanbul ignore else */
      if (types.hasOwnProperty(k)) {
        sanitized[k] = sanitizeRuleType(types[k]);
      }
    }

    this.define(sanitized);
  }

  public extend(
    name: string,
    typeName: string,
    value: IRuleType | IRuleTypeExecutor,
    opts?: IModuleOptions
  ): this {
    const { executors: existingExecutors, ...existing } = this[typeName];
    const { executors, ...custom } = sanitizeRuleType(value);
    return this.define(
      name,
      {
        executors: [...existingExecutors, ...executors],
        ...existing,
        ...custom,
      },
      opts
    );
  }

  public set(key: string, value: any) {
    this[key] = sanitizeRuleType(value);
  }
}
