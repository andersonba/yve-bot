import { get, set } from 'lodash';

export default (store, bot) => store

  .define('output', () =>
    Object.assign({}, store.get('output'), store.get('context')))

  .define('update', (key, value) => {
    const copy = Object.assign({}, store.get());
    bot._store = set(copy, key, value);
    if (/output\./.test(key)) {
      bot._dispatch('outputChanged', store.output());
    }
  })

  .define('get', (key) => {
    return key ? get(bot._store, key) : bot._store;
  })

;
