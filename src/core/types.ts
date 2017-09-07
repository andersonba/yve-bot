import { DefineModule } from './module';
import { Rule, Answer } from '../types';
import { findOptionByAnswer, ensureArray, identifyAnswersInString } from './utils';

const types = {
  Any: {},

  String: {
    parser: (value: Answer) => !!value ? String(value) : '',
    validators: [
      {
        string: true,
        warning: 'Invalid string',
      },
    ]
  },

  Number: {
    parser: (value: Answer) => Number(value),
    validators: [
      {
        number: true,
        warning: 'Invalid number',
      },
    ],
  },

  SingleChoice: {
    parser: (value: Answer | Answer[], rule: Rule) => {
      const option = findOptionByAnswer(rule.options, value);
      return option.value || option.label;
    },
    validators: [
      {
        function: (answer: Answer | Answer[], rule: Rule) =>
          !!findOptionByAnswer(rule.options, answer),
        warning: 'Unknown option',
      },
    ],
  },

  MultipleChoice: {
    parser: (answer: Answer | Answer[], rule: Rule) => {
      let values;
      if (answer instanceof Array) {
        values = answer;
      } else {
        const options = rule.options.map(o => String(o.value || o.label));
        values = identifyAnswersInString(String(answer), options);
      }
      return values.map(value => {
        const option = findOptionByAnswer(rule.options, value);
        return option.value || option.label;
      });
    },
    validators: [
      {
        function: (answer: Answer | Answer[], rule: Rule) => {
          const answers = ensureArray(answer);
          const options = rule.options.map(o => String(o.value || o.label));
          return answers.every(x => options.indexOf(x) >= 0);
        },
        warning: 'Unknown options',
      },
    ],
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
