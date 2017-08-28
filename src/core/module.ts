import { merge } from 'lodash';
import { RedefineConfigurationError } from './exceptions';

export class DefineModule {
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

  extend(name: string, typeName: string, custom: Object): this {
    const obj = this[typeName];
    return this.define(name, merge({}, obj, custom));
  }
}
