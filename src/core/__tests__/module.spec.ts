/* tslint:disable:max-classes-per-file */
import { DefineModule } from '../module';

describe('define', () => {
  test('using object', () => {
    class A extends DefineModule {
      public a: number;
      public b: number;
    }
    const mod = new A();
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
    const mod = new A();
    mod.define('a', 123);
    expect(mod.a).toBe(123);
  });

  test('fails on override', () => {
    class A extends DefineModule {
      public a: number;
    }
    const mod = new A();
    mod.define('a', 123);
    mod.define('a', 321);
    expect(mod.a).toBe(123);
  });

  test('force override', () => {
    class A extends DefineModule {
      public a: number;
    }
    const mod = new A();
    mod.define('a', 123);
    mod.define('a', 321, { override: true });
    expect(mod.a).toBe(321);
  });
});
