import { describe, it } from 'mocha';
import { expect } from 'chai';
import { omit } from 'lodash';
import * as mocks from '../mocks';
import { Types } from '../../src/core/types';

describe('core.types', () => {
  describe('Any', () => {
    it('common', () => {
      expect('parser' in new Types).to.be.false;
      expect('validators' in new Types).to.be.false;
    });
  });

  describe('String', () => {
    const { parser, validators } = (new Types).String;

    it('parser', () => {
      expect(parser('word')).to.be.equal('word');
      expect(parser(123)).to.be.equal('123');
      expect(parser(0)).to.be.equal('0');
      expect(parser('')).to.be.equal('');
    });

    it('validators', () => {
      const values = validators.map(v => omit(v, ['warning']))
      expect(values).to.deep.include({ string: true });
      expect(values).to.have.lengthOf(1);
    });
  });

  describe('Number', () => {
    const { parser, validators } = (new Types).Number;

    it('parser', () => {
      expect(parser('123')).to.be.equal(123);
      expect(parser('0')).to.be.equal(0);
      expect(parser('word')).to.be.NaN;
    });

    it('validators', () => {
      const values = validators.map(v => omit(v, ['warning']))
      expect(values).to.deep.include({ number: true });
      expect(values).to.have.lengthOf(1);
    });
  });

  describe('SingleChoice', () => {
    const { parser, validators } = (new Types).SingleChoice;

    describe('parser', () => {
      it('unknown option', () => {
        const rule = mocks.Rule();
        expect(parser('---', rule)).to.be.undefined;
      });

      it('returning value', () => {
        const rule = mocks.Rule({
          options: [
            mocks.RuleOption({
              label: null,
              value: 'word',
            }),
          ],
        });
        expect(parser('word', rule)).to.be.equal('word');
      });

      it('returning label', () => {
        const rule = mocks.Rule({
          options: [
            mocks.RuleOption({
              label: 'The Word',
              value: null,
            }),
          ],
        });
        expect(parser('The Word', rule)).to.be.equal('The Word');
      });
    });

    describe('validators', () => {
      function testMethod(rule, answer, expected) {
        const result = validators[0].function(answer, rule);
        expect(result).to.be.equal(expected);
      }

      it('using value', () => {
        const rule = mocks.Rule();
        const { value } = rule.options[0];
        testMethod(rule, value, true);
        testMethod(rule, NaN, false);
      });

      it('using slug', () => {
        const rule = mocks.Rule();
        const { label } = rule.options[0];
        testMethod(rule, label, true);
      });

      it('unknown', () => {
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
      it('unknown options', () => {
        const rule = mocks.Rule();
        // from string
        expect(parser('x + y, z', rule)).to.be.empty;
        // from array
        expect(parser(['x', 1], rule)).to.be.empty;
      });

      it('returning value', () => {
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
        expect(parser('word dog word 123', rule)).to.be.deep.equal(['word', 123]);
        // from array
        expect(parser(['word', 123, '123'], rule)).to.be.deep.equal(['word', 123]);
      });

      it('returning label', () => {
        const rule = mocks.Rule({
          options: [
            mocks.RuleOption({
              label: 'The Word',
              value: null,
            }),
          ],
        });
        // from string
        expect(parser('the word is okay', rule)).to.be.deep.equal(['The Word']);
        // from array
        expect(parser(['the word', 'word', 1], rule)).to.be.deep.equal(['The Word']);
      });
    });

    describe('validators', () => {
      it('unknown options', () => {
        const rule = mocks.Rule();
        // from single
        expect(validators[0].function('--', rule)).to.be.false;
        // from multiple
        expect(validators[0].function(['a', 'b'], rule)).to.be.false;
      });

      it('using label', () => {
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
        expect(validators[0].function('a phrase', rule)).to.be.true;
        // from multiple
        expect(validators[0].function(['The Word', 'a phrase'], rule)).to.be.true;
      });

      it('using value', () => {
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
        expect(validators[0].function('A-Phrase', rule)).to.be.true;
        // from multiple
        expect(validators[0].function(['The WorD', 'a-phrase'], rule)).to.be.true;
      });
    });
  });
});
