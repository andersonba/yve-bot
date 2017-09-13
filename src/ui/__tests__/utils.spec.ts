import * as utils from '../utils';

describe('arrayToString', () => {
  test('common', () => {
    function testMethod(arr, sep, expected) {
      expect(utils.arrayToString(arr, sep)).toBe(expected);
    }

    testMethod(['one', 'two', 'three'], 'and', 'one, two and three');
    testMethod(['one', 'two'], 'or', 'one or two');
    testMethod(['one'], 'or', 'one');
  });
});
