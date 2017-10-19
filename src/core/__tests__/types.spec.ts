import { omit } from 'lodash';
import * as mocks from '@test/mocks';
import { Types } from '../types';

describe('Any', () => {
  test('common', () => {
    expect('parser' in new Types).toBeFalsy();
    expect('validators' in new Types).toBeFalsy();
  });
});

describe('String', () => {
  const { parser, validators } = (new Types).String;

  test('parser', () => {
    expect(parser('word')).toBe('word');
    expect(parser(123)).toBe('123');
    expect(parser(0)).toBe('0');
    expect(parser('')).toBe('');
  });

  test('validators', () => {
    const values = validators.map(v => omit(v, ['warning']));
    expect(values).toContainEqual({ string: true });
    expect(values).toHaveLength(1);
  });
});

describe('Number', () => {
  const { parser, validators } = (new Types).Number;

  test('parser', () => {
    expect(parser('123')).toBe(123);
    expect(parser('0')).toBe(0);
    expect(parser('word')).toBeNaN();
  });

  test('validators', () => {
    const values = validators.map(v => omit(v, ['warning']));
    expect(values).toContainEqual({ number: true });
    expect(values).toHaveLength(1);
  });
});

describe('SingleChoice', () => {
  const { parser, validators } = (new Types).SingleChoice;

  describe('parser', () => {
    test('unknown option', () => {
      const rule = mocks.Rule();
      expect(parser('---', rule)).toBeUndefined();
    });

    test('returning value', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: null,
            value: 'word',
          }),
        ],
      });
      expect(parser('word', rule)).toBe('word');
    });

    test('returning label', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: 'The Word',
            value: null,
          }),
        ],
      });
      expect(parser('The Word', rule)).toBe('The Word');
    });
  });

  describe('validators', () => {
    function testMethod(rule, answer, expected) {
      const result = validators[0].function(answer, rule);
      expect(result).toBe(expected);
    }

    test('using value', () => {
      const rule = mocks.Rule();
      const { value } = rule.options[0];
      testMethod(rule, value, true);
      testMethod(rule, NaN, false);
    });

    test('using slug', () => {
      const rule = mocks.Rule();
      const { label } = rule.options[0];
      testMethod(rule, label, true);
    });

    test('unknown', () => {
      const options = [mocks.RuleOption({ label: 'ABC' })];
      const rule = mocks.Rule({ options });
      testMethod(rule, 'ZZZ', false);
      testMethod(rule, undefined, false);
      testMethod(rule, '', false);
    });
  });
});

describe('MultipleChoice', () => {
  const { parser, validators } = (new Types).MultipleChoice;

  describe('parser', () => {
    test('unknown options', () => {
      const rule = mocks.Rule();
      // from string
      expect(parser('x + y, z', rule)).toHaveLength(0);
      // from array
      expect(parser(['x', 1], rule)).toHaveLength(0);
    });

    test('returning value', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: null,
            value: 'word',
          }),
          mocks.RuleOption({
            label: null,
            value: 123,
          }),
        ],
      });
      // from string
      expect(parser('word dog word 123', rule)).toEqual(['word', 123]);
      // from array
      expect(parser(['word', 123, '123'], rule)).toEqual(['word', 123]);
    });

    test('returning label', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: 'The Word',
            value: null,
          }),
        ],
      });
      // from string
      expect(parser('the word is okay', rule)).toEqual(['The Word']);
      // from array
      expect(parser(['the word', 'word', 1], rule)).toEqual(['The Word']);
    });
  });

  describe('validators', () => {
    test('unknown options', () => {
      const rule = mocks.Rule();
      // from single
      expect(validators[0].function('--', rule)).toBeFalsy();
      // from multiple
      expect(validators[0].function(['a', 'b'], rule)).toBeFalsy();
    });

    test('using label', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: 'The Word',
            value: null,
          }),
          mocks.RuleOption({
            label: 'A Phrase',
            value: null,
          }),
        ],
      });
      // from single
      expect(validators[0].function('a phrase', rule)).toBeTruthy();
      // from multiple
      expect(validators[0].function(['The Word', 'a phrase'], rule)).toBeTruthy();
    });

    test('using value', () => {
      const rule = mocks.Rule({
        options: [
          mocks.RuleOption({
            label: null,
            value: 'the word',
          }),
          mocks.RuleOption({
            label: null,
            value: 'a-phrase',
          }),
        ],
      });
      // from single
      expect(validators[0].function('A-Phrase', rule)).toBeTruthy();
      // from multiple
      expect(validators[0].function(['The WorD', 'a-phrase'], rule)).toBeTruthy();
    });
  });
});
