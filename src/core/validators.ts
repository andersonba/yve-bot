import YveBot from '.';
import { IRule } from '../types';
import { DefineModule } from './module';

// tslint:disable-next-line
const isEmail = v =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    v
  ); // http://emailregex.com
const isNumber = v => /^\d+$/.test(v);
const sanitizeLength = v => (isNumber(v) ? Number(v) : v.length);

const validators = {
  required: {
    validate: (expected: boolean, answer: string) =>
      Boolean((answer || '').trim()) === expected,
    warning: 'This is required',
  },

  email: {
    validate: (expected: boolean, answer: string) =>
      isEmail(answer) === expected,
    warning: 'Invalid email format',
  },

  regex: {
    validate: (reg: string, answer: string) => new RegExp(reg).test(answer),
    warning: 'Invalid answer format',
  },

  minWords: {
    validate: (num: number, answer: string) => answer.split(' ').length >= num,
    warning: min => `This answer must have at least ${min} words`,
  },

  maxWords: {
    validate: (num: number, answer: string) => answer.split(' ').length <= num,
    warning: max => `This answer must have a maximum ${max} words`,
  },

  min: {
    validate: (num: number, answer: string) => sanitizeLength(answer) >= num,
    warning: min => `This answer length must be min ${min}`,
  },

  max: {
    validate: (num: number, answer: string) => sanitizeLength(answer) <= num,
    warning: max => `This answer length must be max ${max}`,
  },

  lenght: {
    validate: (num: number, answer: string) => sanitizeLength(answer) === num,
    warning: num => `It must have lenght ${num}`,
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
      fn: (answer: string, rule: IRule, bot: YveBot) => boolean,
      answer: string,
      rule: IRule,
      bot: YveBot
    ) => fn(answer, rule, bot),
    warning: 'Error on execute a validator function',
  },
};

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
    super('validators');
    this.define(validators);
  }
}
