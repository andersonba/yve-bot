import { IModuleOptions, ModuleType } from '../types';

export class DefineModule {
  private _moduleName: ModuleType; /* tslint:disable-line variable-name */

  constructor(name: ModuleType) {
    this._moduleName = name;
  }

  public define(obj: object): this;
  public define(key: string, value: any, opts?: IModuleOptions): this;
  public define(
    key: string | object,
    value?: any | IModuleOptions,
    opts?: IModuleOptions
  ): this {
    const noOverride = !(opts && opts.override);
    if (typeof key !== 'string') {
      Object.keys(key).forEach(k => {
        this.define(k, key[k], value);
      });
    } else if (noOverride && key in this) {
      const klass = typeof this;
      // tslint:disable-next-line
      console.warn(
        `You can't redefine "${key}" in ${klass}. Force it using { override: true } in options argument.`
      );
    } else {
      this.set(key, value);
    }
    return this;
  }

  public defineExtension(...args) {
    this.define.apply(this, args);
    return importer => importer[this._moduleName].define(...args);
  }

  public set(key: string, value: any) {
    this[key] = value;
  }
}
