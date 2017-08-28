import { DefineModule } from './module';
import { Rule, Answer } from '../types';
import { findOptionByAnswer } from './utils';

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
    validators: [
      {
        function: (answer: Answer, rule: Rule) =>
          !!findOptionByAnswer(rule.options, answer),
        warning: 'Unknown option',
      },
    ],
  },

  MultipleChoice: {
    validators: [
      {
        function: (answers: Answer[], rule: Rule) => {
          const options = rule.options.map(o => String(o.value || o.label));
          return [...answers].filter(x => options.indexOf(x) < 0);
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
