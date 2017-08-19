import { RedefineConfigurationError } from './exceptions';
import { RuleOption } from '../types';

export function findOptionByAnswer(
  options: RuleOption[],
  answer: string,
): RuleOption {
  const [option] = options
    .filter(o => o.value === answer || o.label === answer);
  return option;
}

export class YveBotModule {
  public define(key: string, value: any): this;
  public define(obj: Object): this;

  define(key: string | Object, value?: any): this {
    if (typeof key !== 'string') {
      Object.keys(key).forEach(k => {
        this.define(k, key[k]);
      });
    } else if (key in this) {
      throw new RedefineConfigurationError(typeof this, key);
    } else {
      this[key] = value;
    }
    return this;
  }
}
