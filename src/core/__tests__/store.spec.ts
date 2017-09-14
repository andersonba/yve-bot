import { Store } from '../store';

function mockBot() {
  return {
    dispatch: jest.fn(),
  };
}

test('initial state', () => {
  const store = new Store(null);
  expect(store.get()).toEqual({
    currentIdx: null,
    waitingForAnswer: false,
    output: {},
  });
});

test('setting', () => {
  const bot = mockBot();
  const store = new Store(bot);
  store.set('output.word', 'ok');
  expect(bot.dispatch).toBeCalledWith('storeChanged', store.get());
  expect(store.get('output.word')).toBe('ok');
});

test('unsetting', () => {
  const bot = mockBot();
  const store = new Store(bot);
  store.set('output.word', 'ok');
  expect(store.get('output.word')).toBe('ok');
  store.unset('output.word');
  expect(store.get('output')).toEqual({});
});

test('reseting', () => {
  const store = new Store(mockBot());
  store.set('currentIdx', 1);
  expect(store.get('currentIdx')).toBe(1);
  store.reset();
  expect(store.get('currentIdx')).toBeNull();
});

test('replacing', () => {
  const store = new Store(mockBot());
  const obj = {
    currentIdx: 4,
    waitingForAnswer: true,
    output: { a: 1 },
  };
  store.replace(obj);
  expect(store.get()).toEqual(obj);
});
