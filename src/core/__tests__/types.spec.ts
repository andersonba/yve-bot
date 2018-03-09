import YveBot from '..';

test('extend module type', () => {
  YveBot.types.extend('CustomString', 'String', {
    transform: () => 'transform2',
    validators: [{ warning: 'validator 2' }],
  });

  expect(YveBot.types.CustomString).toMatchSnapshot();
});

test('define module type with short mode', () => {

  YveBot.types.define('compact', {
    customProp: '123',
    transform: () => 'value';
    validators: [
      { number: true, warning: 'Message 1' },
      { required: true, warning: 'Message 2' },
    ],
  });

  expect(YveBot.types.compact).toMatchSnapshot();
});
