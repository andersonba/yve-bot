import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as utils from '../../src/ui/utils';

describe('ui.utils', () => {
  describe('arrayToString', () => {
    it('common', () => {
      function testMethod(arr, sep, expected) {
        expect(utils.arrayToString(arr, sep)).to.be.equal(expected);
      }

      testMethod(['one', 'two', 'three'], 'and', 'one, two and three');
      testMethod(['one', 'two'], 'or', 'one or two');
      testMethod(['one'], 'or', 'one');
    });
  });
});
