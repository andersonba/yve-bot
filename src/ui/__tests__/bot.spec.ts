import { loadYaml, sleep, getChatElements } from '@test/utils';
import { YveBotChat } from '../bot';

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
  const onEnd = jest.fn();
  const onEndCopy = jest.fn();
  const onReply = jest.fn();

  new YveBotChat(rules, OPTS)
    .on('start', onStart)
    .on('storeChanged', onStoreChanged)
    .on('end', onEnd)
    .on('end', onEndCopy)
    .on('reply', onReply)
    .start();
  const { input, submit } = getChatElements();

  const msg = 'ok';
  const output = {value: msg};
  const session = 'session';

  expect(onStart).toBeCalledWith(session);

  await sleep();

  input.value = msg;
  submit.click();

  await sleep();

  expect(onReply).toBeCalledWith(msg);
  expect(onStoreChanged).toBeCalledWith({ output, currentIdx: 1, waitingForAnswer: false }, session);
  expect(onEnd).toBeCalledWith(output, session);
  expect(onEndCopy).toBeCalledWith(output, session);
});

describe('DOM behaviors', () => {
  test('initial elements', () => {
    new YveBotChat([], OPTS).start();
    const { conversation, form, input, submit, getTyping } = getChatElements();

    expect(conversation).toBeDefined;
    expect(getTyping()).toBeDefined;
    expect(form).toBeDefined;
    expect(input).toBeDefined;
    expect(submit).toBeDefined;
  });

  test('user reply', async () => {
    const rules = loadYaml(`
    - message: Your name
      type: String
    `);
    new YveBotChat(rules, OPTS).start();
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
    new YveBotChat(rules, OPTS).start();
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
        - Three
    `);
    new YveBotChat(rules, OPTS).start();
    const { target, input, submit, getBubbleButtons, getUserMessages } = getChatElements();

    await sleep();

    // showing the options
    const bubbles = getBubbleButtons();
    expect(input.hasAttribute('disabled')).toBeTruthy;
    expect(input.placeholder).toContain('Choose an option');
    expect(submit.hasAttribute('disabled')).toBeTruthy;
    expect(bubbles).toHaveLength(3);
    expect(getUserMessages()).toHaveLength(0);
    expect(target).toMatchSnapshot();

    // sending answer
    bubbles[0].click();
    await sleep();

    expect(input.hasAttribute('disabled')).toBeFalsy;
    expect(input.placeholder).toBeUndefined;
    expect(submit.hasAttribute('disabled')).toBeFalsy;
    expect(getBubbleButtons()).toHaveLength(0);
    expect(getUserMessages()).toHaveLength(1);
    expect(target).toMatchSnapshot();
  });

  test('user reply with single choice and no options', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: SingleChoice
    `);
    new YveBotChat(rules, OPTS).start();
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
    new YveBotChat(rules, OPTS).start();
    const { input, submit, getBubbleButtons, getBubbleDone, getUserMessages } = getChatElements();

    await sleep();

    const bubbles = getBubbleButtons();
    const done = getBubbleDone();

    // showing the options
    expect(done).toBeDefined;
    expect(input.hasAttribute('disabled')).toBeTruthy;
    expect(input.placeholder).toContain('Choose the options');
    expect(submit.hasAttribute('disabled')).toBeTruthy;
    expect(bubbles).toHaveLength(3);
    expect(getUserMessages()).toHaveLength(0);

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
    expect(input.hasAttribute('disabled')).toBeFalsy;
    expect(input.placeholder).toBeUndefined;
    expect(submit.hasAttribute('disabled')).toBeFalsy;
    expect(getBubbleButtons()).toHaveLength(0);
    expect(getUserMessages()).toHaveLength(1);
  });

  test('user reply with multiple choice and no options', async () => {
    const rules = loadYaml(`
    - message: Make your choice
      type: MultipleChoice
    `);
    new YveBotChat(rules, OPTS).start();
    const { getBubbleButtons } = getChatElements();
    await sleep();
    expect(getBubbleButtons()).toHaveLength(0);
  });

  test('bot typing', async () => {
    const rules = loadYaml(`
    - message: Hello
      delay: 10
    `);
    new YveBotChat(rules).start();

    await sleep(5);

    // typing
    const { getTyping } = getChatElements();
    expect(getTyping().classList).toContain('is-typing');

    await sleep(20);

    // typed
    expect(getTyping().classList).not.toContain('is-typing');
  });

  test('bot sleeping', async () => {
    const rules = loadYaml(`
    - message: Hello
      delay: 5
      sleep: 5
    `);
    new YveBotChat(rules).start();

    // sleeping
    const { getTyping, getBotMessages } = getChatElements();
    expect(getTyping().classList).not.toContain('is-typing');
    expect(getBotMessages()).toHaveLength(0);

    // typing
    await sleep(6);
    expect(getBotMessages()).toHaveLength(0);
    expect(getTyping().classList).toContain('is-typing');

    // typed
    await sleep(11);
    expect(getBotMessages()).toHaveLength(1);
    expect(getTyping().classList).not.toContain('is-typing');
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
    new YveBotChat(rules, OPTS).start();
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
    new YveBotChat(rules, Object.assign({ autoFocus: false }, OPTS)).start();
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
});
