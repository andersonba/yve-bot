import { describe, it } from 'mocha';
import { expect } from 'chai';
import YveBot from '../../src/core';

function getValidate(name) {
  return new YveBot().validators[name].validate;
}

describe('validators', () => {
  it('validators.length', () => {
    const validators = Object.keys(new YveBot().validators);
    validators.shift(); // define method

    expect(validators).to.be.deep.eq([
      'required',
      'regex',
      'min',
      'max',
      'lenght',
      'string',
      'number',
      'function',
    ]);
  });

  it('required', () => {
    const validate = getValidate('required');
    expect(validate(true, '')).to.be.false;
    expect(validate(true, '     ')).to.be.false;
    expect(validate(true, undefined)).to.be.false;
    expect(validate(true, 'hello')).to.be.true;
    expect(validate(true, ' - ')).to.be.true;
  });

  it('regex', () => {
    const validate = getValidate('regex');
    expect(validate('^1(.*)0$', '1 xsad 0')).to.be.true;
    expect(validate('^1(.*)0$', '0 - 1')).to.be.false;
  });

  it('min', () => {
    const validate = getValidate('min');
    expect(validate(4, 'abcd')).to.be.true;
    expect(validate(2, 'abcd')).to.be.true;
    expect(validate(2, ['a', 'b', 'c'])).to.be.true;
    expect(validate(0, [])).to.be.true;
    expect(validate(5, 10)).to.be.true;
    expect(validate(5, 1)).to.be.false;
  });

  it('max', () => {
    const validate = getValidate('max');
    expect(validate(4, 'abcd')).to.be.true;
    expect(validate(10, 'abcd')).to.be.true;
    expect(validate(3, 'abcd')).to.be.false;
    expect(validate(5, ['a', 'b', 'c'])).to.be.true;
    expect(validate(3, 5)).to.be.false;
    expect(validate(8, 5)).to.be.true;
  });

  it('lenght', () => {
    const validate = getValidate('lenght');
    expect(validate(4, 'abcd')).to.be.true;
    expect(validate(3, ['a', 'b', 'c'])).to.be.true;
    expect(validate(0, 0)).to.be.true;
    expect(validate(5, 0)).to.be.false;
  });

  it('string', () => {
    const validate = getValidate('string');
    expect(validate(true, 'abcd')).to.be.true;
    expect(validate(true, '123')).to.be.false;
    expect(validate(true, null)).to.be.false;
    expect(validate(true, 0)).to.be.false;
  });

  it('number', () => {
    const validate = getValidate('number');
    expect(validate(true, 'abcd')).to.be.false;
    expect(validate(true, '123')).to.be.true;
    expect(validate(true, 0)).to.be.true;
    expect(validate(true, 31)).to.be.true;
  });

  it('function', () => {
    const validate = getValidate('function');
    expect(validate(() => true, '')).to.be.true;
    expect(validate(answer => answer === 'ok', 'ok')).to.be.true;
    expect(validate((a, b) => (a + b) === 5, 2, 3)).to.be.true;
  });
});
