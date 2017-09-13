import { describe, it } from 'mocha';
import { expect } from 'chai';
import { DefineModule } from '../../src/core/module';

describe('core.module', () => {
  describe('define', () => {
    it('using object', () => {
      class A extends DefineModule {
        public a: number;
        public b: number;
      }
      const mod = new A;
      mod.define({
        a: 1,
        b: 2,
      });

      expect(mod.a).to.be.equal(1);
      expect(mod.b).to.be.equal(2);
    });

    it('using string', () => {
      class A extends DefineModule {
        public a: number;
      }
      const mod = new A;
      mod.define('a', 123);
      expect(mod.a).to.be.equal(123);
    });

    it('fails on overwrite', () => {
      class A extends DefineModule {
        public a: number;
      }
      const mod = new A;
      mod.define('a', 123);
      expect(() => mod.define('a', 321)).to.throw(/can't redefine/);
      expect(mod.a).to.be.equal(123);
    });
  });

  describe('extend', () => {
    it('common', () => {
      class A extends DefineModule {
        public a: Object;
        public b: Object;
      }
      const mod = new A;
      mod.define('a', { a: 1 });
      mod.extend('b', 'a', {
        b: 2,
      });
      expect(mod.b).to.be.deep.equal({
        a: 1,
        b: 2,
      });
    });
  });
});
