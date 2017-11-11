import { DefineModule } from './module';

const listeners = {
  includes: (input: RegExp | string | number, answer: string): boolean => {
    if (input instanceof RegExp) {
      return listeners.regex(input, answer);
    } else if (input instanceof String || !!input) {
      return answer.indexOf(String(input)) >= 0;
    }
    return false;
  },

  equals: (input: string | number, answer: string): boolean => {
    if (input instanceof String || !!input) {
      return answer === String(input);
    }
    return false;
  },

  regex: (input: RegExp, answer: string): boolean => {
    return input.test(answer);
  },

  function: (fn: (answer: string) => boolean, answer: string): boolean => {
    return fn(answer);
  }
};

export class Listeners extends DefineModule {
  public includes: typeof listeners.includes;
  public equals: typeof listeners.equals;
  public regex: typeof listeners.regex;
  public function: typeof listeners.function;

  constructor() {
    super();
    this.define(listeners);
  }
}
