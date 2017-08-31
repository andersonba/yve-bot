import { DefineModule } from './module';
import { Rule, Answer, ParsedAnswer } from '../types';
import { findOptionByAnswer, treatAsArray, identifyAnswersInString } from './utils';

const types = {
  Any: {},

  String: {
    parser: (value: string) => !!value ? String(value) : '',
    validators: [
      {
        string: true,
        warning: 'Invalid string',
      },
    ]
  },

  Number: {
    parser: (value: string) => Number(value),
    validators: [
      {
        number: true,
        warning: 'Invalid number',
      },
    ],
  },

  SingleChoice: {
    parser: (value: string, rule: Rule) => {
      const option = findOptionByAnswer(rule.options, value);
      return option.value || option.label;
    },
    validators: [
      {
        function: (answer: ParsedAnswer, rule: Rule) =>
          !!findOptionByAnswer(rule.options, answer),
        warning: 'Unknown option',
      },
    ],
  },

  MultipleChoice: {
    parser: (answer: Answer, rule: Rule) => {
      let values;
      if (answer instanceof Array) {
        values = answer;
      } else {
        const options = rule.options.map(o => String(o.value || o.label));
        values = identifyAnswersInString(answer, options);
      }
      return values.map(value => {
        const option = findOptionByAnswer(rule.options, value);
        return option.value || option.label;
      });
    },
    validators: [
      {
        function: (answer: Answer, rule: Rule) => {
          const answers = treatAsArray(answer);
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
