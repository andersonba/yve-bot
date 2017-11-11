import { Listeners } from '../listeners';

const listeners = new Listeners;

describe('includes', () => {
  test('regex', () => {
    const val = /help/i;
    const msg = 'HELP ME PLEASE';
    expect(listeners.includes(val, msg)).toBeTruthy();
    expect(listeners.includes(val, 'Hi')).toBeFalsy();
  });

  test('string', () => {
    const val = 'help';
    const msg = 'HELP ME PLEASE';
    expect(listeners.includes(val, msg)).toBeTruthy();
    expect(listeners.includes(val, 'Hi')).toBeFalsy();
  });

  test('number', () => {
    const val = 123;
    const msg = 'Hi, have 123';
    expect(listeners.includes(val, msg)).toBeTruthy();
    expect(listeners.includes(val, '9')).toBeFalsy();
  });

  test('unknown type', () => {
    expect(listeners.includes(function() {} as any, '9')).toBeFalsy();
  });
});

describe('equals', () => {
  test('string', () => {
    const val = 'hello';
    const msg = 'HELLO';
    expect(listeners.equals(val, msg)).toBeTruthy();
    expect(listeners.equals(val, 'Hi')).toBeFalsy();
  });

  test('number', () => {
    const val = 123;
    const msg = '123';
    expect(listeners.equals(val, msg)).toBeTruthy();
    expect(listeners.equals(val, '9')).toBeFalsy();
  });

  test('unknown type', () => {
    expect(listeners.equals(function() {} as any, '9')).toBeFalsy();
  });
});

test('regex', () => {
  const msg = 'HELP ME PLEASE';
  expect(listeners.includes(/help/i, msg)).toBeTruthy();
  expect(listeners.includes(/help/, msg)).toBeFalsy();
});

test('function', () => {
  const msg = 'Hi';
  const fn = msg => msg === 'Hi';
  const fn2 = msg => msg.indexOf('999') >= 0;
  expect(listeners.function(fn, msg)).toBeTruthy();
  expect(listeners.function(fn2, msg)).toBeFalsy();
});
