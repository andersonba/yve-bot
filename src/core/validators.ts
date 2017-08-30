import { DefineModule } from './module';
import { YveBot } from './bot';
import { Rule, Answer } from '../types';
import { treatAsArray } from './utils';

const isNumber = v => /^\d+$/.test(v);
const sanitizeLength = v => isNumber(v) ? Number(v) : v.length;

function testAsArray(
  validator: (input: any, answer: String, rule?: Rule) => boolean,
): (expected: any, answer: Answer, rule?: Rule) => boolean {
  return (expected, answer, rule) => {
    const answers = treatAsArray(answer);
    return answers
      .map(a => validator(expected, a, rule))
      .every(a => a === true);
  };
}

const validators = {
  required: {
    validate: testAsArray((expected: boolean, answer: string) =>
      Boolean((answer || '').trim()) === expected),
    warning: 'This is required',
  },

  regex: {
    validate: testAsArray((reg: string, answer: string) =>
      new RegExp(reg).test(answer)),
    warning: 'Invalid answer format',
  },

  minWords: {
    validate: testAsArray((num: number, answer: string) =>
      answer.split(' ').length >= num),
    warning: min => `This answer must have at least ${min} words`,
  },

  maxWords: {
    validate: testAsArray((num: number, answer: string) =>
      answer.split(' ').length <= num),
    warning: max => `This answer must have a maximum ${max} words`,
  },

  min: {
    validate: testAsArray((num: number, answer: string) =>
      sanitizeLength(answer) >= num),
    warning: min => `This answer length must be min ${min}`,
  },

  max: {
    validate: testAsArray((num: number, answer: string) =>
      sanitizeLength(answer) <= num),
    warning: max => `This answer length must be max ${max}`,
  },

  lenght: {
    validate: testAsArray((num: number, answer: string) =>
      sanitizeLength(answer) === num),
    warning: (num) => `It must have lenght ${num}`,
  },

  string: {
    validate: testAsArray((expected: boolean, answer: string): boolean =>
      Boolean(!isNumber(answer) && typeof answer === 'string') === expected),
    warning: 'It must be a string',
  },

  number: {
    validate: testAsArray((expected: boolean, answer: string): boolean =>
      isNumber(answer) === expected),
    warning: 'It must be a number',
  },

  function: {
    validate: testAsArray((
      fn: (answer: string, rule: Rule) => boolean,
      answer: string,
      rule: Rule,
    ) => fn(answer, rule)),
    warning: 'Error on execute a validator function',
  },
}

export class Validators extends DefineModule {
  public required: typeof validators.required;
  public regex: typeof validators.regex;
  public minWords: typeof validators.minWords;
  public maxWords: typeof validators.maxWords;
  public min: typeof validators.min;
  public max: typeof validators.max;
  public length: typeof validators.lenght;
  public string: typeof validators.string;
  public number: typeof validators.number;
  public function: typeof validators.function;

  constructor() {
    super();
    this.define(validators);
  }
}
