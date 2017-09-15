import * as faker from 'faker';
import * as mocks from '@test/mocks';
import { InvalidAttributeError } from '../exceptions';
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
