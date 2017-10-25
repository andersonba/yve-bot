import * as faker from 'faker';
import * as mocks from '@test/mocks';
import { calculateDelayToTypeMessage } from '../utils';
import { InvalidAttributeError, RuleNotFound } from '../exceptions';
import { sleep, loadYaml } from '@test/utils';
import { YveBot } from '../bot';
import { Store } from '../store';
import { Controller } from '../controller';

const OPTS = {
  enableWaitForSleep: false,
};

test('initial state', () => {
  const opts = {
    enableWaitForSleep: false,
    rule: {
      delay: 1,
      sleep: 1,
    },
  };
  const bot = new YveBot([], opts);
  expect(bot.sessionId).toBe('session');
  expect(bot.options).toEqual(opts);
  expect(bot.store).toBeInstanceOf(Store);
  expect(bot.controller).toBeInstanceOf(Controller);
});

test('sanitize rule', () => {
  const rules = loadYaml(`
  - Hello
  - type: SingleChoice
  - type: MultipleChoice
    options:
      - One
  `);
  const bot = new YveBot(rules, OPTS);
  expect(bot.rules[0].message).toBe('Hello');
  expect(bot.rules[1].options).toEqual([]);
  expect(bot.rules[2].options).toEqual([{ value: 'One' }]);
});

test('event binding', async () => {
  const rules = loadYaml(`
  - message: Colors?
    name: color
    type: String
  `);
  const session = 'session';
  const color = 'blue';
  const output = { color };

  const onStart = jest.fn();
  const onStartCopy = jest.fn();
  const onEnd = jest.fn();
  const onHear = jest.fn();
  const onTyping = jest.fn();
  const onTyped = jest.fn();
  const onTalk = jest.fn();

  const bot = new YveBot(rules, OPTS)
    .on('start', onStart)
    .on('start', onStartCopy)
    .on('end', onEnd)
    .on('hear', onHear)
    .on('typing', onTyping)
    .on('typed', onTyped)
    .on('talk', onTalk)
    .start();

  expect(onStart).toBeCalledWith(session);
  expect(onStartCopy).toBeCalledWith(session);

  await sleep();
  expect(onTyping).toBeCalledWith(session);
  expect(onTyped).toBeCalledWith(session);
  expect(onTalk).toBeCalledWith(rules[0].message, rules[0], session);
  expect(onHear).toBeCalledWith(session);

  bot.hear(color);
  await sleep();

  expect(onEnd).toBeCalledWith(output, session);
});

test('send message as bot', () => {
  const customRule = { delay: 1000 };
  const onTalk = jest.fn();

  const bot = new YveBot([], OPTS)
    .on('talk', onTalk)
    .start();
  bot.talk('Hi');
  bot.talk('Bye', customRule);
  expect(onTalk).toHaveBeenCalledTimes(2);
  expect(onTalk).toBeCalledWith('Hi', {}, 'session');
  expect(onTalk).toBeCalledWith('Bye', customRule, 'session');
});

test('using session', () => {
  const session = faker.random.number();
  const bot = new YveBot([{ message: 'OK' }], OPTS);
  const rules = bot.rules;
  const store = bot.store.get();
  bot.session(session);
  expect(bot.sessionId).toBe(session);
  expect(bot.store.get()).toEqual(store);
  expect(bot.rules).toEqual(rules);
});

test('using session with custom store/rules', () => {
  const session = faker.random.number();
  const newRules = [mocks.Rule()];
  const newStore = {
    currentIdx: faker.random.number(),
    output: { color: faker.commerce.color() },
    waitingForAnswer: true,
  };
  const bot = new YveBot([], OPTS);
  bot.session(session, {
    rules: newRules,
    store: newStore,
  });
  expect(bot.sessionId).toBe(session);
  expect(bot.store.get()).toEqual(newStore);
  expect(bot.rules).toHaveLength(1);
  expect(bot.rules[0].message).toBe(newRules[0].message);
});

test('auto reply message', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Color
    type: String
    replyMessage: Thanks
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('red');
  await sleep();

  expect(onTalk).toBeCalledWith('Color', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Thanks', {}, 'session');
});

test('compiled template', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Color
    name: color
    type: String
    replyMessage: "Your color: {color} {color.invalid}"
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('red');
  await sleep();

  expect(onTalk).toBeCalledWith('Your color: red', {}, 'session');
});

test('compiled template with dot notation using single choice', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Number
    name: number
    type: SingleChoice
    options:
      - label: One
        value: 1
      - label: Two
        value: 2
    replyMessage: "Your number: {number} ({number.label})"
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear(1);
  await sleep();

  expect(onTalk).toBeCalledWith('Your number: 1 (One)', {}, 'session');
});

test('compiled template with dot notation using multiple choice', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Number
    name: numbers
    type: MultipleChoice
    options:
      - label: One
        value: 1
      - label: Two
        value: 2
      - label: Three
        value: 3
    replyMessage: "Your numbers: {numbers.0.label}, {numbers.1.value} and {numbers.2}"
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear([1, 2, 3]);
  await sleep();

  expect(onTalk).toBeCalledWith('Your numbers: One, 2 and 3', {}, 'session');
});

test('jumping to rule', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Step 1
    next: three
  - message: Skipped
    name: two
  - message: Step 3
    name: three
  `);
  new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();
  await sleep();

  expect(onTalk).not.toBeCalledWith(rules[1].message, rules[1], 'session');
  expect(onTalk).toBeCalledWith(rules[0].message, rules[0], 'session');
  expect(onTalk).toBeCalledWith(rules[2].message, rules[2], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping to option next', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Step 1
    type: SingleChoice
    options:
      - value: Jump
        next: three
  - message: Skipped
    name: two
  - message: Step 3
    name: three
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('Jump');
  await sleep();

  expect(onTalk).not.toBeCalledWith(rules[1].message, rules[1], 'session');
  expect(onTalk).toBeCalledWith(rules[0].message, rules[0], 'session');
  expect(onTalk).toBeCalledWith(rules[2].message, rules[2], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping to invalid rule', (done) => {
  const rules = loadYaml(`
  - message: Hello
    next: bye
  - U name?
  `);
  new YveBot(rules, OPTS)
    .on('error', err => {
      expect(err).toBeInstanceOf(RuleNotFound);
      done();
    })
    .start();
});

test('repeat ask on error validation', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Tell me a number
    type: Number
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();
  await sleep();
  expect(onTalk).toBeCalledWith('Tell me a number', rules[0], 'session');
  bot.hear('asdfg');
  await sleep();
  expect(onTalk).toBeCalledWith('Invalid number', rules[0], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('warning message as function', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Tell me a number
    type: Number
    validators:
      - max: 10
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();
  await sleep();
  bot.hear(1000);
  await sleep();
  expect(onTalk).toBeCalledWith('This answer length must be max 10', rules[0], 'session');
});

test('bot sleeping', async () => {
  const onTalk = jest.fn();
  const onTyping = jest.fn();
  const onTyped = jest.fn();
  const rules = loadYaml(`
  - sleep: 2
  - message: Ok
    delay: 0
  `);
  new YveBot(rules)
    .on('talk', onTalk)
    .on('typing', onTyping)
    .on('typed', onTyped)
    .start();
  expect(onTalk).not.toBeCalled();
  expect(onTyping).not.toBeCalled();
  await sleep(5);
  expect(onTyping).toBeCalledWith('session');
  expect(onTyped).toBeCalledWith('session');
  expect(onTalk).toBeCalledWith('Ok', rules[1], 'session');
});

test('running actions', async () => {
  const act = jest.fn();
  const preAct = jest.fn();
  const rules = loadYaml(`
  - message: Hello
    actions:
      - testAction: false
      - unknown: 10
    preActions:
      - testPreAction: true
  `);
  const bot = new YveBot(rules, OPTS);
  bot.actions.define('testAction', act);
  bot.actions.define('testPreAction', preAct);
  bot.start();
  await sleep();
  expect(act).toBeCalledWith(false, rules[0], bot);
  expect(preAct).toBeCalledWith(true, rules[0], bot);
});

test('transform answer', async () => {
  const rules = loadYaml(`
  - message: Enter
    name: value
    type: ValidTransform
  `);
  const onEnd = jest.fn();
  const bot = new YveBot(rules, OPTS);
  bot.types.define('ValidTransform', {
    transform: () => 'Transformed',
  });

  bot
    .on('end', onEnd)
    .start();

  await sleep();
  bot.hear('Original');
  await sleep();

  expect(onEnd).toBeCalledWith({ value: 'Transformed' }, 'session');
});

test('throw error on transform answer', async (done) => {
  const rules = loadYaml(`
  - message: Enter
    name: value
    type: InvalidTransform
  `);
  const onHear = jest.fn();
  const bot = new YveBot(rules, OPTS);
  const customError = new Error('Transform failed');
  bot.types.define('InvalidTransform', {
    transform: () => Promise.reject(customError),
  });

  bot
    .on('hear', onHear)
    .on('error', err => {
      expect(err).toEqual(customError);
      done();
    })
    .start();

  await sleep();
  bot.hear('Original');
});

test('calculate delay to type', async () => {
  const onTyped = jest.fn();
  const rules = loadYaml(`
  - message: .
  - message: A long message here
  `);
  new YveBot(rules)
    .on('typed', onTyped)
    .start();

  await sleep(calculateDelayToTypeMessage(rules[0].message) + 10);
  expect(onTyped).toHaveBeenCalledTimes(1);

  await sleep(calculateDelayToTypeMessage(rules[1].message) + 10);
  expect(onTyped).toHaveBeenCalledTimes(2);
});

test('do nothing when bot is not waiting for answer', async () => {
  const onTalk = jest.fn();
  const onHear = jest.fn();
  const bot = new YveBot([], OPTS)
    .on('talk', onTalk)
    .on('hear', onHear)
    .start();
  await sleep();
  bot.hear('Ok');
  await sleep();
  expect(onTalk).not.toBeCalled();
  expect(onHear).not.toBeCalled();
});

test('using default warning message as function', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Exception on validate
    type: String
    validators:
      - defaultWarning: true
  `);
  const bot = new YveBot(rules, OPTS);
  bot.validators.define('defaultWarning', {
    validate: () => false,
    warning: () => null,
  });
  bot
    .on('talk', onTalk)
    .start();
  await sleep();
  bot.hear('ok');
  await sleep();
  expect(onTalk).toBeCalledWith('Invalid value for "String" type', rules[0], 'session');
});

test('throw error in warning message as function', async (done) => {
  const customError = new Error('Unknown in validator');
  const rules = loadYaml(`
  - message: Exception on validate
    type: String
    validators:
      - failed: true
  `);
  const bot = new YveBot(rules, OPTS);
  bot.validators.define('failed', {
    validate: () => false,
    warning: () => { throw customError; },
  });

  bot
    .on('error', err => {
      expect(err).toEqual(customError);
      done();
    })
    .start();

  await sleep();
  bot.hear('Ok');
});

test('throw error', (done) => {
  // throw as default
  const bot = new YveBot([]);
  expect(() => {
    bot.dispatch('error', new Error('Unknown'));
  }).toThrow(/Unknown/);

  // custom error
  new YveBot([{type: 'Unknown'}], OPTS)
    .on('error', err => {
      expect(err).toBeInstanceOf(InvalidAttributeError);
      done();
    })
    .start();
});
