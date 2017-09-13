import { YveBot } from '../bot';

function getValidate(name) {
  return YveBot.prototype.validators[name].validate;
}

test('validators.length', () => {
  const validators = Object.keys(YveBot.prototype.validators);
  expect(validators).toMatchObject([
    'required',
    'email',
    'regex',
    'minWords',
    'maxWords',
    'min',
    'max',
    'lenght',
    'string',
    'number',
    'function',
  ]);
});

test('required', () => {
  const validate = getValidate('required');
  expect(validate(true, '')).toBeFalsy;
  expect(validate(true, '     ')).toBeFalsy;
  expect(validate(true, undefined)).toBeFalsy;
  expect(validate(true, 'hello')).toBeTruthy;
  expect(validate(true, ' - ')).toBeTruthy;
});

test('email', () => {
  const validate = getValidate('email');
  expect(validate(true, 'email@domain.com')).toBeTruthy;
  expect(validate(true, 'email@w.edu')).toBeTruthy;
  expect(validate(true, 'a.com')).toBeFalsy;
  expect(validate(true, '@a.com')).toBeFalsy;
  expect(validate(true, '@')).toBeFalsy;
  expect(validate(true, 'a@.com')).toBeFalsy;
});

test('regex', () => {
  const validate = getValidate('regex');
  expect(validate('^1(.*)0$', '1 xsad 0')).toBeTruthy;
  expect(validate('^1(.*)0$', '0 - 1')).toBeFalsy;
});

test('minWords', () => {
  const validate = getValidate('minWords');
  expect(validate(2, 'abcd efgh')).toBeTruthy;
  expect(validate(1, 'abcd')).toBeTruthy;
  expect(validate(1, 'abc def ghi')).toBeTruthy;
  expect(validate(3, 'abcd efgh')).toBeFalsy;
});

test('maxWords', () => {
  const validate = getValidate('maxWords');
  expect(validate(2, 'abcd efgh')).toBeTruthy;
  expect(validate(2, 'abcd')).toBeTruthy;
  expect(validate(2, 'a b c d')).toBeFalsy;
});

test('min', () => {
  const validate = getValidate('min');
  expect(validate(4, 'abcd')).toBeTruthy;
  expect(validate(2, 'abcd')).toBeTruthy;
  expect(validate(2, ['a', 'b', 'c'])).toBeTruthy;
  expect(validate(0, [])).toBeTruthy;
  expect(validate(5, 10)).toBeTruthy;
  expect(validate(5, 1)).toBeFalsy;
});

test('max', () => {
  const validate = getValidate('max');
  expect(validate(4, 'abcd')).toBeTruthy;
  expect(validate(10, 'abcd')).toBeTruthy;
  expect(validate(3, 'abcd')).toBeFalsy;
  expect(validate(5, ['a', 'b', 'c'])).toBeTruthy;
  expect(validate(3, 5)).toBeFalsy;
  expect(validate(8, 5)).toBeTruthy;
});

test('lenght', () => {
  const validate = getValidate('lenght');
  expect(validate(4, 'abcd')).toBeTruthy;
  expect(validate(3, ['a', 'b', 'c'])).toBeTruthy;
  expect(validate(0, 0)).toBeTruthy;
  expect(validate(5, 0)).toBeFalsy;
});

test('string', () => {
  const validate = getValidate('string');
  expect(validate(true, 'abcd')).toBeTruthy;
  expect(validate(true, '123')).toBeFalsy;
  expect(validate(true, null)).toBeFalsy;
  expect(validate(true, 0)).toBeFalsy;
});

test('number', () => {
  const validate = getValidate('number');
  expect(validate(true, 'abcd')).toBeFalsy;
  expect(validate(true, '123')).toBeTruthy;
  expect(validate(true, 0)).toBeTruthy;
  expect(validate(true, 31)).toBeTruthy;
});

test('function', () => {
  const validate = getValidate('function');
  expect(validate(() => true, '')).toBeTruthy;
  expect(validate(answer => answer === 'ok', 'ok')).toBeTruthy;
  expect(validate((a, b) => (a + b) === 5, 2, 3)).toBeTruthy;
});
