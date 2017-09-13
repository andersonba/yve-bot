import { DefineModule } from '../module';

describe('define', () => {
  test('using object', () => {
    class A extends DefineModule {
      public a: number;
      public b: number;
    }
    const mod = new A;
    mod.define({
      a: 1,
      b: 2,
    });

    expect(mod.a).toBe(1);
    expect(mod.b).toBe(2);
  });

  test('using string', () => {
    class A extends DefineModule {
      public a: number;
    }
    const mod = new A;
    mod.define('a', 123);
    expect(mod.a).toBe(123);
  });

  test('fails on overwrite', () => {
    class A extends DefineModule {
      public a: number;
    }
    const mod = new A;
    mod.define('a', 123);
    expect(() => mod.define('a', 321)).toThrow(/can't redefine/);
    expect(mod.a).toBe(123);
  });
});

describe('extend', () => {
  test('common', () => {
    class A extends DefineModule {
      public a: Object;
      public b: Object;
    }
    const mod = new A;
    mod.define('a', { a: 1 });
    mod.extend('b', 'a', {
      b: 2,
    });
    expect(mod.b).toMatchObject({
      a: 1,
      b: 2,
    });
  });
});
