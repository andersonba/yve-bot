import * as mocks from '@test/mocks';
import { loadYaml, sleep } from '@test/utils';
import * as faker from 'faker';

import YveBot from '..';
import { Controller } from '../controller';
import { InvalidAttributeError, RuleNotFound } from '../exceptions';
import { Store } from '../store';
import { calculateDelayToTypeMessage } from '../utils';

const OPTS = {
  enableWaitForSleep: false,
};

test('define modules', () => {
  const action = () => 'action';
  const typeE = { executors: [{ transform: () => 'type' }] };
  const validator = { warning: 'validator' };

  YveBot.actions.define('test', action);
  YveBot.types.define('test', typeE);
  YveBot.validators.define('test', validator);

  const bot = new YveBot([]);

  /* tslint:disable */
  expect(bot.actions.test).toBe(action);
  expect(bot.types.test).toBe(typeE);
  expect(bot.validators.test).toBe(validator);
  /* tslint:enable */
});

test('initial state', () => {
  const opts = {
    enableWaitForSleep: false,
    rule: {
      delay: 1,
      sleep: 1,
    },
    timePerChar: 40,
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
    skip: true
    options:
      - One
  - type: SingleChoice
    options:
      - value: One
        synonyms: 1, one, oNe,ONE
  - type: SingleChoice
    multiline: false
  `);
  const bot = new YveBot(rules, OPTS);
  expect(bot.rules[0].message).toBe('Hello');
  expect(bot.rules[0].skip()).toBeFalsy();
  expect(bot.rules[0].multiline).toBeTruthy();
  expect(bot.rules[1].options).toEqual([]);
  expect(bot.rules[2].options).toEqual([{ value: 'One' }]);
  expect(bot.rules[2].skip()).toBeTruthy();
  expect(bot.rules[3].options[0].synonyms).toEqual([ '1', 'one', 'oNe', 'ONE' ]);
  expect(bot.rules[4].multiline).toBeFalsy();
});

test('convert flows to rules', () => {
  const rules = loadYaml(`
  - flow: welcome
    rules:
      - Hello!
      - type: String

  - flow: bye
    rules:
      - Bye!
  `);
  const bot = new YveBot(rules, OPTS);
  expect(bot.rules).toHaveLength(3);

  expect(bot.rules[0].message).toBe('Hello!');
  expect(bot.rules[0].flow).toBe('welcome');

  expect(bot.rules[1].type).toBe('String');
  expect(bot.rules[1].flow).toBe('welcome');

  expect(bot.rules[2].message).toBe('Bye!');
  expect(bot.rules[2].flow).toBe('bye');
});

test('user context', () => {
  const context = { a: 1, b: { c: 3 }};
  const bot = new YveBot([], { context });
  expect(bot.context).toEqual(context);
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

  await sleep();
  expect(onStart).toBeCalledWith(session);
  await sleep();
  expect(onStartCopy).toBeCalledWith(session);
  await sleep();
  expect(onTyping).toBeCalledWith(session);
  await sleep();
  expect(onTyped).toBeCalledWith(session);
  await sleep();
  expect(onTalk).toBeCalledWith(rules[0].message, rules[0], session);
  await sleep();
  expect(onHear).toBeCalledWith(session);

  bot.hear(color);
  await sleep();

  expect(onEnd).toBeCalledWith(output, session);
});

test('prioritize the currentIdx from store when starting bot', () => {
  const rules = loadYaml(`
  - message: Question 1
    type: String
  - message: Question 2
    type: String
  `);
  const bot = new YveBot(rules, OPTS);
  bot.session('session', { store: { currentIdx: 1 } })
    .start();
  expect(bot.store.get('currentIdx')).toBe(1);
});

test('auto-run on starting bot', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Message 1
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk);

  bot.session('new', { store: { currentIdx: 0, waitingForAnswer: false } })
    .start();
  await sleep();
  expect(bot.store.get('currentIdx')).toBe(1);
  expect(onTalk).toHaveBeenCalledTimes(1);
});

test('do not auto-run with waitingForAnswer on starting bot', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Message 1
  - message: Question 1
    type: String
  - message: Message 2
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk);

  bot.session('new', { store: { currentIdx: 1, waitingForAnswer: true } })
    .start();
  await sleep();
  expect(bot.store.get('currentIdx')).toBe(1);
  expect(onTalk).not.toBeCalled();
});

test('send message as bot', async () => {
  const customRule = { delay: 1000 };
  const onTalk = jest.fn();

  const bot = new YveBot([], OPTS)
    .on('talk', onTalk)
    .start();

  bot.talk('Hi');
  await sleep();
  bot.talk('Bye', customRule);
  await sleep();
  expect(onTalk).toHaveBeenCalledTimes(2);
  expect(onTalk).toBeCalledWith('Hi', {}, 'session');
  expect(onTalk).toBeCalledWith('Bye', customRule, 'session');
});

test('using session with different sessionId', () => {
  const session = faker.random.number();
  const bot = new YveBot([{ message: 'OK' }], OPTS);
  const rules = bot.rules;
  const store = bot.store.get();
  bot.store.set('filled', true);
  bot.session(session);
  expect(bot.store.get('filled')).toBe(undefined);
  expect(bot.sessionId).toBe(session);
  expect(bot.store.get()).toEqual(store);
  expect(bot.rules).toEqual(rules);
});

test('using session with current sessionId', () => {
  const bot = new YveBot([{ message: 'OK' }], OPTS);
  const rules = bot.rules;
  const store = bot.store.get();
  bot.store.set('filled', true);
  bot.session(bot.sessionId);
  expect(bot.store.get()).toEqual({
    ...store,
    filled: true,
  });
  expect(bot.rules).toEqual(rules);
});

test('using session with custom context/store/rules', () => {
  const session = faker.random.number();
  const newRules = [mocks.Rule()];
  const newContext = { user: 123 };
  const newStore = {
    context: newContext,
    currentIdx: faker.random.number(),
    output: { color: faker.commerce.color() },
    waitingForAnswer: true,
  };
  const bot = new YveBot([], OPTS);
  bot.session(session, {
    context: newContext,
    rules: newRules,
    store: newStore,
  });
  expect(bot.sessionId).toBe(session);
  expect(bot.store.get()).toEqual(newStore);
  expect(bot.rules).toHaveLength(1);
  expect(bot.rules[0].message).toBe(newRules[0].message);
  expect(bot.context.user).toBe(123);
});

test('addRules', async () => {
  const rules = loadYaml(`
  - message: Hello
  - message: Question
    type: String
    name: question
  - message: Bye
    name: bye
  `);
  const bot = new YveBot(rules, OPTS).start();

  expect(bot.controller.indexes).toEqual({
    bye: 2,
    question: 1,
  });
  expect(bot.rules).toHaveLength(3);
  expect(Object.keys(bot.controller.indexes)).toHaveLength(2);

  bot.addRules(loadYaml(`
  - message: Hello again!
  - message: Question 2
    type: String
    name: question2
  - message: Tchau!
    name: bye
  `));

  expect(bot.controller.indexes).toEqual({
    bye: 5,
    question: 1,
    question2: 4,
  });
  expect(bot.rules).toHaveLength(6);
  expect(Object.keys(bot.controller.indexes)).toHaveLength(3);
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

test('auto reply message with inherited delay', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Color
    delay: 1234
    type: String
    replyMessage: Thanks
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('red');
  await sleep();

  expect(onTalk).toBeCalledWith('Thanks', { delay: 1234 }, 'session');
});

test('auto reply message for single choice', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Color
    type: SingleChoice
    replyMessage: Nice color!
    options:
      - label: red
        replyMessage: Red! Nice!
      - label: white
        replyMessage: Really?
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('red');
  await sleep();

  expect(onTalk).toBeCalledWith('Color', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Red! Nice!', {}, 'session');
  expect(onTalk).not.toBeCalledWith('Nice color!', {}, 'session');
  expect(onTalk).not.toBeCalledWith('Really?', {}, 'session');
});

test('auto reply message for multiple choice', async () => {
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: Color
    type: MultipleChoice
    replyMessage: Nice color!
    options:
      - label: red
        replyMessage: Red! Nice!
      - label: white
        replyMessage: Really?
      - label: blue
        replyMessage: Nooo!
  `);
  const bot = new YveBot(rules, OPTS)
    .on('talk', onTalk)
    .start();

  await sleep();
  bot.hear('red, white');
  await sleep();

  expect(onTalk).toBeCalledWith('Color', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Red! Nice!', {}, 'session');
  expect(onTalk).not.toBeCalledWith('Nice color!', {}, 'session');
  expect(onTalk).not.toBeCalledWith('Nooo!', {}, 'session');
  expect(onTalk).not.toBeCalledWith('Really?', {}, 'session');
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

  expect(onTalk).not.toBeCalledWith('Skipped', rules[1], 'session');
  expect(onTalk).toBeCalledWith('Step 1', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Step 3', rules[2], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping inside of flow', async () => {
  const onTalk = jest.fn();
  const flows = loadYaml(`
  - flow: welcome
    rules:
      - message: Hello
        next: okay
      - Skip
      - message: Okay
        name: okay
  `);
  new YveBot(flows, OPTS)
    .on('talk', onTalk)
    .start();
  await sleep();

  const flow = 'welcome';
  const { rules } = flows[0];
  expect(onTalk).not.toBeCalledWith('Skip', { flow, ...rules[1] }, 'session');
  expect(onTalk).toBeCalledWith('Hello', { flow, ...rules[0] }, 'session');
  expect(onTalk).toBeCalledWith('Okay', { flow, ...rules[2] }, 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping between flows', async () => {
  const onTalk = jest.fn();
  const flows = loadYaml(`
  - flow: first
    rules:
      - message: Hello
        next: second.two
      - Skip 1
  - flow: second
    rules:
      - Skip 2
      - message: Here
        name: two
  `);
  new YveBot(flows, OPTS)
    .on('talk', onTalk)
    .start();
  await sleep();

  expect(onTalk).not.toBeCalledWith('Skip 1', { flow: 'first', ...flows[0].rules[1] }, 'session');
  expect(onTalk).not.toBeCalledWith('Skip 2', { flow: 'second', ...flows[1].rules[0] }, 'session');
  expect(onTalk).toBeCalledWith('Hello', { flow: 'first', ...flows[0].rules[0] }, 'session');
  expect(onTalk).toBeCalledWith('Here', { flow: 'second', ...flows[1].rules[1] }, 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping to first rule of flow', async () => {
  const onTalk = jest.fn();
  const flows = loadYaml(`
  - flow: first
    rules:
      - message: Hello
        next: "flow:second"
  - flow: second
    rules:
      - message: Here
        name: two
  `);
  new YveBot(flows, OPTS)
    .on('talk', onTalk)
    .on('error', console.error)
    .start();
  await sleep();

  expect(onTalk).toBeCalledWith('Hello', { flow: 'first', ...flows[0].rules[0] }, 'session');
  expect(onTalk).toBeCalledWith('Here', { flow: 'second', ...flows[1].rules[0] }, 'session');
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

  expect(onTalk).not.toBeCalledWith('Skipped', rules[1], 'session');
  expect(onTalk).toBeCalledWith('Step 1', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Step 3', rules[2], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
});

test('jumping to invalid rule', (done) => {
  const rules = loadYaml(`
  - message: Hello
    next: bye
  - U name?
  `);
  new YveBot(rules, OPTS)
    .on('error', (err) => {
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
  - sleep: 5
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
  await sleep(10);
  expect(onTyping).toBeCalledWith('session');
  expect(onTyped).toBeCalledWith('session');
  expect(onTalk).toBeCalledWith('Ok', rules[1], 'session');
});

test('running actions', async () => {
  const act = jest.fn();
  const stringAct = jest.fn();
  const preAct = jest.fn();
  const postAct = jest.fn();
  const rules = loadYaml(`
  - message: Hello
    type: String
    actions:
      - testAction: false
      - unknown: 10
      - testStringWay
    preActions:
      - testPreAction: true
    postActions:
      - testPostAction: true
  `);
  const bot = new YveBot(rules, OPTS);
  bot.actions.define('testAction', act);
  bot.actions.define('testPreAction', preAct);
  bot.actions.define('testPostAction', postAct);
  bot.actions.define('testStringWay', stringAct);
  bot.start();

  await sleep();
  expect(act).toBeCalledWith(false, rules[0], bot);
  expect(stringAct).toBeCalledWith(true, rules[0], bot);
  expect(preAct).toBeCalledWith(true, rules[0], bot);
  expect(postAct).not.toBeCalled();

  bot.hear('okay');
  await sleep();
  expect(postAct).toBeCalledWith(true, rules[0], bot);
});

test('end bot when last message has skip', async () => {
  const onEnd = jest.fn();
  const rules = loadYaml(`
    - message: Hello
      skip: true
  `);

  const bot = new YveBot(rules, OPTS);
  const onEnd = jest.fn();

  bot.on('end', onEnd).start();
  await sleep();
  expect(onEnd).toHaveBeenCalledTimes(1);
});

test('end bot when last message has skip function', async () => {
  const onEnd = jest.fn();
  const rules = [{
    message: 'Hello',
    skip: jest.fn(() => true),
  }];

  const bot = new YveBot(rules, OPTS);
  const onEnd = jest.fn();

  bot.on('end', onEnd).start();
  await sleep();
  expect(rules[0].skip).toHaveBeenCalledTimes(1);
  expect(onEnd).toHaveBeenCalledTimes(1);
});

test('ruleTypes with multi executors', async () => {
  const rules = loadYaml(`
  - message: Hello
    name: testStep
    type: MultiStep
  `);
  const bot = new YveBot(rules, OPTS);
  const onEnd = jest.fn();
  bot.types.define('MultiStep', {
    executors: [{
      transform: async (answer) => `${answer} transformed`,
    }, {
      transform: async (answer) => `${answer} transformed2`,
    }, {
      transform: async (answer) => {
        bot.store.set('output.testStepTemp', answer);
        throw new bot.exceptions.PauseRuleTypeExecutors();
      },
    }, {
      transform: async (answer) => `${answer} transformed3`,
    }],
  });

  bot.on('end', onEnd).start();
  await sleep();
  expect(bot.store.get('executors.testStep.currentIdx')).toEqual(undefined);
  bot.hear('answer');
  await sleep();
  expect(bot.store.get('executors.testStep.currentIdx')).toEqual(3);
  bot.hear(bot.store.get('output.testStepTemp'));
  await sleep();
  expect(bot.store.get('output.testStep'))
    .toEqual('answer transformed transformed2 transformed3');
  expect(onEnd).toHaveBeenCalledTimes(1);
});

test('invalid rule in executors', async () => {
  const bot = new YveBot([{ name: 'test' }], OPTS);
  bot.session('new', { store: { currentIdx: 0, waitingForAnswer: true } });
  bot.hear('unknown');
  await sleep();
  expect(bot.store.get('output.test')).toBe('unknown');
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
    executors: [{
      transform: async () => 'Transformed',
    }],
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
    executors: [{
      transform: async () => Promise.reject(customError),
    }],
  });

  bot
    .on('hear', onHear)
    .on('error', (err) => {
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

  await sleep(calculateDelayToTypeMessage(rules[0].message, 40) + 10);
  expect(onTyped).toHaveBeenCalledTimes(1);

  await sleep(calculateDelayToTypeMessage(rules[1].message, 40) + 10);
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
      - defaultWarning  # string way
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

test('passive mode: using Passive type', async () => {
  const listeners = [
    { includes: 'help', next: 'help' },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - type: Passive
  - Welcome
  - message: How can I help you?
    name: help
  `);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
  bot.hear('help me');
  await sleep();
  expect(onTalk).toBeCalledWith('How can I help you?', rules[2], 'session');
});

test('passive mode: using unknown listener', async () => {
  const listeners = [
    { unknown: 'asd', next: 'help' },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`- type: PassiveLoop`);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  bot.hear('help me');
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
});

test('passive mode: skip Passive type when no matches', async () => {
  const listeners = [
    { includes: 'help', next: 'help' },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - type: Passive
  - message: Welcome
  - message: How can I help you?
    name: help
  `);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
  bot.hear('Hi');
  await sleep();
  expect(onTalk).toBeCalledWith('Welcome', rules[1], 'session');
});

test('passive mode: enabled to all rules', async () => {
  const listeners = [
    { includes: 'help', next: 'help', passive: true },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: What's your name?
    name: name
    type: String
  - message: Thank you
  - message: How can I help you?
    name: help
  `);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  bot.hear('help me');
  await sleep();
  expect(onTalk).toBeCalledWith('What\'s your name?', rules[0], 'session');
  expect(onTalk).toBeCalledWith('How can I help you?', rules[2], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
  expect(bot.store.get('output.name')).toBeUndefined();
});

test('passive mode: disable for specific rule', async () => {
  const listeners = [
    { includes: 'help', next: 'help', passive: true },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - message: What's your name?
    name: name
    type: String
    passive: false
  - message: Thank you
    exit: true
  - message: How can I help you?
    name: help

  `);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  bot.hear('help me');
  await sleep();
  expect(onTalk).toBeCalledWith('What\'s your name?', rules[0], 'session');
  expect(onTalk).toBeCalledWith('Thank you', rules[1], 'session');
  expect(onTalk).toHaveBeenCalledTimes(2);
  expect(bot.store.get('output.name')).toBe('help me');
});

test('passive mode: using PassiveLoop type', async () => {
  const listeners = [
    { includes: 'help', next: 'help' },
  ];
  const onTalk = jest.fn();
  const rules = loadYaml(`
  - type: PassiveLoop
  - Welcome
  - message: How can I help you?
    name: help
  `);
  const bot = new YveBot(rules, OPTS);
  bot.listen(listeners).on('talk', onTalk).start();
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
  bot.hear('hi');
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
  bot.hear('hello');
  await sleep();
  expect(onTalk).not.toHaveBeenCalled();
  bot.hear('help me');
  await sleep();
  expect(onTalk).toBeCalledWith('How can I help you?', rules[2], 'session');
});

test('sequential dispatching events using queue', async (done) => {
  const rules = loadYaml(`
  - Welcome
  `);

  let first;
  let second;

  const bot = new YveBot(rules, OPTS);
  bot
    .on('typing', async () => {
      first = Date.now();
      await sleep(5);
    })
    .on('typed', () => {
      second = Date.now();
    })
    .on('end', () => {
      expect(first < second).toBe(true);
      done();
    })
    .start();
});

test('coverage non-promise event', async (done) => {
  const error = new Error('Unresolved promise');
  const onError = jest.fn();

  const bot = new YveBot([], OPTS)
    .on('error', (e) => {
      expect(e).toBe(error);
      done();
    })
    .on('typing', () => { throw error; })
    .start();

  bot.dispatch('typing');
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
    .on('error', (err) => {
      expect(err).toEqual(customError);
      done();
    })
    .start();

  await sleep();
  bot.hear('Ok');
});

test('throw error', (done) => {
  // failed error listener
  expect(() => {
    const bot = new YveBot([])
      .on('error', () => { throw new Error('Failed to throw error'); })
      .start();
    bot.dispatch('error', new Error('First error'));
  }).toThrow(/Failed to throw/);

  // custom error
  new YveBot([{type: 'Unknown'}], OPTS)
    .on('error', (err) => {
      expect(err).toBeInstanceOf(InvalidAttributeError);
      done();
    })
    .start();
});
