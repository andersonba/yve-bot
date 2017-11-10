import merge from 'lodash-es/merge';

type Options = {
  override: boolean;
};

export class DefineModule {
  public define(key: string, value: any, opts: Options): this;
  public define(key: string, value: any): this;
  public define(obj: Object): this;

  define(key: string | Object, value?: any | Options, opts?: Options): this {
    const noOverride = !(opts && opts.override);
    if (typeof key !== 'string') {
      Object.keys(key).forEach(k => {
        this.define(k, key[k], value);
      });
    } else if (noOverride && key in this) {
      const klass = typeof this;
      console.warn(`You can't redefine "${key}" in ${klass}. You can force it using { override: true } in options argument.`);
    } else {
      this[key] = value;
    }
    return this;
  }

  extend(name: string, typeName: string, custom: Object, opts?: Options): this {
    const obj = this[typeName];
    return this.define(name, merge({}, obj, custom), opts);
  }
}
