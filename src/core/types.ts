import uniq from 'lodash-es/uniq';

import { Answer, IRule, IRuleType } from '../types';
import { DefineModule } from './module';
import * as utils from './utils';

const types: { [name: string]: IRuleType } = {
  Any: {},

  Passive: {},

  PassiveLoop: {},

  String: {
    executors: [{
      transform: async (value: Answer) => String(value),
    }],
  },

  Number: {
    executors: [{
      transform: async (value: Answer) => Number(value),
      validators: [
        {
          number: true,
          warning: 'Invalid number',
        },
      ],
    }],
  },

  SingleChoice: {
    executors: [{
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
    }],
  },

  MultipleChoice: {
    executors: [{
      transform: async (answer: Answer | Answer[], rule: IRule) => {
        let values;
        if (answer instanceof Array) {
          values = answer;
        } else {
          let options = [];
          rule.options.forEach((o) => {
            options.push(String(o.value || o.label));
            if (o.synonyms) {
              options = options.concat(o.synonyms);
            }
          });
          values = utils.identifyAnswersInString(String(answer), options);
        }
        return uniq(values
          .map((value) => {
            const option = utils.findOptionByAnswer(rule.options, value);
            if (!option) {
              return undefined;
            }
            return option.value === undefined ? option.label : option.value;
          })
          .filter((x) => x !== undefined));
      },
      validators: [
        {
          function: (answer: Answer | Answer[], rule: IRule) => {
            const answers = utils.ensureArray(answer);
            const options = rule.options.map((o) => String(o.value || o.label));
            return answers.every((a) => options.some((o) => utils.isMatchAnswer(a, o)));
          },
          warning: 'Unknown options',
        },
      ],
    }],
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
    this.define(types);
  }
}
