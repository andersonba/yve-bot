import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Actions } from '../../src/core/actions';

describe('core.actions', () => {
  describe('timeout', () => {
    it('common', async () => {
      const now = +new Date();
      await (new Actions).timeout(100);
      expect(+new Date() >= (now + 100)).to.be.true;
    });
  });
});
