import merge from 'lodash-es/merge';
import { ModuleType } from '../types';

interface IOptions {
  override: boolean;
}

export class DefineModule {
  private _moduleName: ModuleType; /* tslint:disable-line variable-name */

  constructor(name: ModuleType) {
    this._moduleName = name;
  }

  public define(obj: object): this;
  public define(key: string, value: any, opts?: IOptions): this;
  public define(key: string | object, value?: any | IOptions, opts?: IOptions): this {
    const noOverride = !(opts && opts.override);
    if (typeof key !== 'string') {
      Object.keys(key).forEach((k) => {
        this.define(k, key[k], value);
      });
    } else if (noOverride && key in this) {
      const klass = typeof this;
      // tslint:disable-next-line
      console.warn(`You can't redefine "${key}" in ${klass}. Force it using { override: true } in options argument.`);
    } else {
      this[key] = value;
    }
    return this;
  }

  public extend(name: string, typeName: string, custom: object, opts?: IOptions): this {
    const obj = this[typeName];
    return this.define(name, merge({}, obj, custom), opts);
  }

  public defineExtension(...args) {
    this.define.apply(this, args);
    return (importer) => importer[this._moduleName].define(...args);
  }
}
