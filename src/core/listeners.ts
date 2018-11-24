import { DefineModule } from './module';

const isStringOrNumber = inp => ['string', 'number'].indexOf(typeof inp) >= 0;

const listeners = {
  includes: (input: RegExp | string | number, answer: string): boolean => {
    if (input instanceof RegExp) {
      return listeners.regex(input, answer);
    } else if (isStringOrNumber(input)) {
      return answer.toLowerCase().indexOf(String(input).toLowerCase()) >= 0;
    }
    return false;
  },

  equals: (input: string | number, answer: string): boolean => {
    if (isStringOrNumber(input)) {
      return answer.toLowerCase() === String(input).toLowerCase();
    }
    return false;
  },

  regex: (input: RegExp, answer: string): boolean => {
    return input.test(answer);
  },

  function: (fn: (answer: string) => boolean, answer: string): boolean => {
    return fn(answer);
  },
};

export class Listeners extends DefineModule {
  public includes: typeof listeners.includes;
  public equals: typeof listeners.equals;
  public regex: typeof listeners.regex;
  public function: typeof listeners.function;

  constructor() {
    super('listeners');
    this.define(listeners);
  }
}
