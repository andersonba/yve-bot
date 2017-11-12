import merge from 'lodash-es/merge';

interface IOptions {
  override: boolean;
}

export class DefineModule {
  public define(obj: object): this;
  public define(key: string, value: any, opts: IOptions): this;

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
}
