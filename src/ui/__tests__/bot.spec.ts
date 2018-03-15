import { getChatElements, loadYaml, sleep } from '@test/utils';
import YveBotUI from '..';

const OPTS = {
  yveBotOptions: {
    enableWaitForSleep: false,
  },
};

beforeEach(() => {
  document.body.innerHTML = '';
});

test('event binding', async () => {
  const rules = loadYaml(`
  - name: value
    type: String
  `);
  const onStart = jest.fn();
  const onStoreChanged = jest.fn();
  const onListen = jest.fn();
  const onHear = jest.fn();
  const onEnd = jest.fn();
  const onEndCopy = jest.fn();
  const onReply = jest.fn();

  new YveBotUI(rules, OPTS)
    .on('start', onStart)
    .on('storeChanged', onStoreChanged)
    .on('listen', onListen)
    .on('hear', onHear)
    .on('end', onEnd)
    .on('end', onEndCopy)
    .on('reply', onReply)
    .start();
  const { input, submit } = getChatElements();

  const msg = 'ok';
  const output = {value: msg};
  const session = 'session';

  await sleep();
  expect(onStart).toBeCalledWith(session);

  await sleep();
  expect(onHear).toBeCalledWith(rules[0], session);

  input.value = msg;
  submit.click();

  await sleep();

  expect(onReply).toBeCalledWith(msg, session);
  expect(onListen).toBeCalledWith(msg, rules[0], session);
  await sleep();
  expect(onStoreChanged).toBeCalledWith({ output, currentIdx: 1, waitingForAnswer: false }, session);
  await sleep();
  expect(onEnd).toBeCalledWith(output, session);
  await sleep();
  expect(onEndCopy).toBeCalledWith(output, session);
});

test('passive support', async () => {
  const rules = loadYaml(`
  - type: Passive
  - Welcome to support
  - message: How can I help you?
    name: help
  `);
  const onListen = jest.fn();
  new YveBotUI(rules, OPTS)
    .listen([
      { includes: 'help', next: 'help' },
    ])
    .on('listen', onListen)
    .start();

  const { target, input, submit, getBotMessages } = getChatElements();

  await sleep();
  input.value = 'help me';
  submit.click();
  await sleep();
  expect(getBotMessages()).toHaveLength(1);
  expect(target).toMatchSnapshot();
});

describe('DOM behaviors', () => {
  test('initial elements', async () => {
    const rules = loadYaml(`
    - message: Hello
    `);

    new YveBotUI(rules, OPTS).start();
    const { target, conversation, form, input, submit, getTyping } = getChatElements();

    await sleep();

    expect(conversation).not.toBeNull();
    expect(getTyping()).not.toBeNull();
    expect(form).not.toBeNull();
    expect(input).not.toBeNull();
    expect(submit).not.toBeNull();
    expect(target).toMatchSnapshot();
  });

  test('bot with name', async () => {
    const rules = loadYaml(`
    - message: Hello
    `);
    new YveBotUI(rules, { name: 'YveBot', ...OPTS }).start();
    const { target, getSenderName } = getChatElements();

    await sleep();

    expect(getSenderName()).not.toBeNull();
    expect(target).toMatchSnapshot();
  });

  test('bot with timestamp', async () => {
    const _now = Date.now; // tslint:disable-line variable-name
    Date.now = jest.fn().mockReturnValue(0);

    const rules = loadYaml(`
    - message: Hello
    `);
    new YveBotUI(rules, { name: 'Yvebot', timestampable: true, ...OPTS }).start();
    const { target, getTimestamp } = getChatElements();

    await sleep();

    expect(getTimestamp()).not.toBeNull();
    expect(target).toMatchSnapshot();

    Date.now = _now;
  });

  test('user reply', async () => {
    const rules = loadYaml(`
    - message: Your name
      type: String
    `);
    new YveBotUI(rules, OPTS).start();
    const { target, input, submit, getMessages, getUserMessages, getBotMessages } = getChatElements();

    await sleep();

    input.value = 'James';
    submit.click();

    await sleep();

    expect(getMessages()).toHaveLength(2);
    expect(getUserMessages()).toHaveLength(1);
    expect(getBotMessages()).toHaveLength(1);

    expect(target).toMatchSnapshot();
  });

  test('user reply without message', async () => {
    const rules = loadYaml(`
    - message: Your name
      type: String
    `);
    new YveBotUI(rules, OPTS).start();
    const { input, submit, getUserMessages } = getChatElements();

    input.value = '';
    submit.click();

    await sleep();

    expect(getUserMessages()).toHaveLength(0);
  });

  test('user reply with single choice', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: SingleChoice
      options:
        - label: One
        - value: Two
        - label: Three
          value:
        - label:
          value: Four
        - Five
    `);
    new YveBotUI(rules, OPTS).start();
    const { target, input, submit, getBubbleButtons, getUserMessages } = getChatElements();

    await sleep();

    // showing the options
    const bubbles = getBubbleButtons();
    expect(input.hasAttribute('disabled')).toBeTruthy();
    expect(input.placeholder).toContain('Choose an option');
    expect(submit.hasAttribute('disabled')).toBeTruthy();
    expect(bubbles).toHaveLength(5);
    expect(getUserMessages()).toHaveLength(0);
    expect(target).toMatchSnapshot();

    // sending answer
    bubbles[0].click();
    await sleep();

    expect(input.hasAttribute('disabled')).toBeFalsy();
    expect(input.placeholder).toBe('Type your message');
    expect(submit.hasAttribute('disabled')).toBeFalsy();
    expect(getBubbleButtons()).toHaveLength(0);
    expect(getUserMessages()).toHaveLength(1);
    expect(target).toMatchSnapshot();
  });

  test('user reply with single choice and no options', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: SingleChoice
    `);
    new YveBotUI(rules, OPTS).start();
    const { getBubbleButtons } = getChatElements();
    await sleep();
    expect(getBubbleButtons()).toHaveLength(0);
  });

  test('user reply with multiple choice', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: MultipleChoice
      options:
        - label: One
        - value: Two
        - Three
    `);
    new YveBotUI(rules, OPTS).start();
    const { target, input, submit, getBubbleButtons, getBubbleDone, getUserMessages } = getChatElements();

    await sleep();

    const bubbles = getBubbleButtons();
    const done = getBubbleDone();

    // showing the options
    expect(done).not.toBeNull();
    expect(input.hasAttribute('disabled')).toBeTruthy();
    expect(input.placeholder).toContain('Choose the options');
    expect(submit.hasAttribute('disabled')).toBeTruthy();
    expect(bubbles).toHaveLength(3);
    expect(getUserMessages()).toHaveLength(0);
    expect(target).toMatchSnapshot();

    // select one
    bubbles[0].click();
    expect(bubbles[0].classList).toContain('selected');
    expect(bubbles[1].classList).not.toContain('selected');
    expect(getUserMessages()).toHaveLength(0);

    // unselect
    bubbles[0].click();
    expect(bubbles[0].classList).not.toContain('selected');
    expect(bubbles[1].classList).not.toContain('selected');
    expect(getUserMessages()).toHaveLength(0);

    // select all
    bubbles[0].click();
    bubbles[1].click();
    expect(bubbles[0].classList).toContain('selected');
    expect(bubbles[1].classList).toContain('selected');
    expect(getUserMessages()).toHaveLength(0);

    // sending answer
    done.click();
    expect(input.hasAttribute('disabled')).toBeFalsy();
    expect(input.placeholder).toBe('Type your message');
    expect(submit.hasAttribute('disabled')).toBeFalsy();
    expect(getBubbleButtons()).toHaveLength(0);
    expect(getUserMessages()).toHaveLength(1);
  });

  test('user reply with multiple choice and no options', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: MultipleChoice
    `);
    new YveBotUI(rules, OPTS).start();
    const { getBubbleButtons } = getChatElements();
    await sleep();
    expect(getBubbleButtons()).toHaveLength(0);
  });

  test('user click on more options using maxOptions', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: SingleChoice
      maxOptions: 3
      options:
        - One
        - Two
        - Three
        - Four
        - Five
        - Six
        - Seven
    `);
    new YveBotUI(rules, OPTS).start();
    const { target, getBubbleButtons, getBubbleMoreOptions } = getChatElements();
    await sleep();
    // page 1
    expect(getBubbleButtons()).toHaveLength(3);
    expect(getBubbleMoreOptions()).not.toBeNull();
    expect(target).toMatchSnapshot();
    getBubbleMoreOptions().click();
    // page 2
    expect(getBubbleButtons()).toHaveLength(5);
    expect(getBubbleMoreOptions()).not.toBeNull();
    getBubbleMoreOptions().click();
    // page 3
    expect(getBubbleButtons()).toHaveLength(7);
    expect(getBubbleMoreOptions()).not.toBeNull();
    getBubbleMoreOptions().click();
    // page 4 - no more button
    expect(getBubbleButtons()).toHaveLength(7);
    expect(getBubbleMoreOptions()).toBeNull();
  });

  test('bot typing', async () => {
    const rules = loadYaml(`
    - message: Hello
      delay: 10
    `);
    const bot = new YveBotUI(rules).start();

    await sleep(5);

    // typing
    const { getTyping } = getChatElements();
    expect(getTyping().classList).toContain('is-typing');

    await sleep(20);

    // typed
    expect(getTyping().classList).not.toContain('is-typing');

    // using methods
    bot.typing();
    await sleep(5);
    expect(getTyping().classList).toContain('is-typing');
    bot.typed();
    await sleep(5);
    expect(getTyping().classList).not.toContain('is-typing');
  });

  test('bot hearing', async() => {
    const rules = loadYaml(`
    - message: Hello
      type: String
    - message: name
      type: String
      multline: false
    - message: Nice
    `);
    const inputClass = '.yvebot-form-input';
    new YveBotUI(rules, OPTS).start();
    const { input, submit, target } = getChatElements();

    await sleep();

    expect(input.type).toBe('textarea');
    input.value = 'msg';
    submit.click();

    await sleep();

    let modifiedInput = target.querySelector(inputClass);
    expect(modifiedInput.type).toBe('text');
    modifiedInput.value = 'another msg';
    submit.click();

    await sleep();

    modifiedInput = target.querySelector(inputClass);
    expect(modifiedInput.type).toBe('textarea');
  });

  test('bot sleeping', async () => {
    const rules = loadYaml(`
    - message: Hello
      delay: 1
    `);
    new YveBotUI(rules).start();

    // sleeping
    const { getTyping, getBotMessages } = getChatElements();
    expect(getTyping().classList).not.toContain('is-typing');
    expect(getBotMessages()).toHaveLength(0);

    // typed
    await sleep(5);
    expect(getBotMessages()).toHaveLength(1);
  });

  test('autofocus', async () => {
    const rules = loadYaml(`
    - type: Any
    - message: Make your choice
      type: SingleChoice
      options:
        - One
        - Two
    `);
    new YveBotUI(rules, OPTS).start();
    const { input, submit, getBubbleButtons } = getChatElements();

    await sleep();

    // sending message
    expect(document.activeElement).toEqual(input);
    input.value = 'A testing message';
    submit.click();
    expect(document.activeElement).toEqual(input);

    await sleep();

    // clicking on bubble
    const bubbles = getBubbleButtons();
    bubbles[0].click();
    expect(document.activeElement).toEqual(input);
  });

  test('disabled autofocus', async () => {
    const rules = loadYaml(`
    - type: Any
    - message: Make your choice
      type: SingleChoice
      options:
        - One
        - Two
    `);
    new YveBotUI(rules, { autoFocus: false, ...OPTS }).start();
    const { input, submit, getBubbleButtons } = getChatElements();

    await sleep();

    // sending message
    expect(document.activeElement).not.toEqual(input);
    input.value = 'A testing message';
    submit.click();
    expect(document.activeElement).not.toEqual(input);

    await sleep();

    // clicking on bubble
    const bubbles = getBubbleButtons();
    bubbles[0].click();
    expect(document.activeElement).not.toEqual(input);
  });

  test('submit message when press Enter in textarea', async() => {
    const rules = loadYaml(`
    - message: value
      type: String
    - message: bye
      type: String
      multline: false
    `);

    new YveBotUI(rules, OPTS).start();
    const { input, chat } = getChatElements();

    await sleep();

    expect(input.type).toBe('textarea');
    input.value = 'msg';
    const event = new KeyboardEvent('keydown', { keyCode: 13 });
    chat.dispatchEvent(event);

    await sleep();

    let modifiedInput = chat.querySelector('.yvebot-form-input');
    expect(modifiedInput.type).toBe('text');
  });
});
