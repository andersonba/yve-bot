import { uniq } from 'lodash';
import { DefineModule } from './module';
import { Rule, Answer, RuleType } from '../types';
import * as utils from './utils';


const types: { [name: string]: RuleType } = {
  Any: { executors: [{}] },

  String: {
    executors: [{
      transform: async (value: Answer) => String(value),
      validators: [
        {
          string: true,
          warning: 'Invalid string',
        },
      ],
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
      transform: async (value: Answer | Answer[], rule: Rule) => {
        const option = utils.findOptionByAnswer(rule.options, value);
        if (!option) {
          return undefined;
        }
        return option.value || option.label;
      },
      validators: [
        {
          function: (answer: Answer | Answer[], rule: Rule) =>
            !!utils.findOptionByAnswer(rule.options, answer),
          warning: 'Unknown option',
        },
      ],
    }],
  },

  MultipleChoice: {
    executors: [{
      transform: async (answer: Answer | Answer[], rule: Rule) => {
        let values;
        if (answer instanceof Array) {
          values = answer;
        } else {
          const options = rule.options.map(o => String(o.value || o.label));
          values = utils.identifyAnswersInString(String(answer), options);
        }
        return uniq(values
          .map(value => {
            const option = utils.findOptionByAnswer(rule.options, value);
            if (!option) {
              return undefined;
            }
            return option.value || option.label;
          })
          .filter(x => x));
      },
      validators: [
        {
          function: (answer: Answer | Answer[], rule: Rule) => {
            const answers = utils.ensureArray(answer);
            const options = rule.options.map(o => String(o.value || o.label));
            return answers.every(a => options.some(o => utils.isMatchAnswer(a, o)));
          },
          warning: 'Unknown options',
        },
      ],
    }],
  },
};

export class Types extends DefineModule {
  public Any: typeof types.Any;
  public String: typeof types.String;
  public Number: typeof types.Number;
  public SingleChoice: typeof types.SingleChoice;
  public MultipleChoice: typeof types.MultipleChoice;

  constructor() {
    super();
    this.define(types);
  }
}
