import { DefineModule } from './module';
import { YveBot } from './bot';
import { Rule } from '../types';

const isNumber = v => /^\d+$/.test(v);
const sanitizeLength = v => isNumber(v) ? Number(v) : v.length;

const validators = {
  required: {
    validate: (expected: boolean, answer: string) =>
      Boolean((answer || '').trim()) === expected,
    warning: 'This is required',
  },

  regex: {
    validate: (reg: string, answer: string) =>
      new RegExp(reg).test(answer),
    warning: 'Invalid answer format',
  },

  minWords: {
    validate: (num: number, answer: string) =>
      answer.split(' ').length >= num,
    warning: min => `This answer must have at least ${min} words`,
  },

  maxWords: {
    validate: (num: number, answer: string) =>
      answer.split(' ').length <= num,
    warning: max => `This answer must have a maximum ${max} words`,
  },

  min: {
    validate: (num: number, answer: string) =>
      sanitizeLength(answer) >= num,
    warning: min => `This answer length must be min ${min}`,
  },

  max: {
    validate: (num: number, answer: string) =>
      sanitizeLength(answer) <= num,
    warning: max => `This answer length must be max ${max}`,
  },

  lenght: {
    validate: (num: number, answer: string) =>
      sanitizeLength(answer) === num,
    warning: (num) => `It must have lenght ${num}`,
  },

  string: {
    validate: (expected: boolean, answer: string): boolean =>
      Boolean(!isNumber(answer) && typeof answer === 'string') === expected,
    warning: 'It must be a string',
  },

  number: {
    validate: (expected: boolean, answer: string): boolean =>
      isNumber(answer) === expected,
    warning: 'It must be a number',
  },

  function: {
    validate: (
      fn: (answer: string, rule: Rule) => boolean,
      answer: string,
      rule: Rule,
    ) => fn(answer, rule),
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
