import { set } from 'lodash';

export default store => store

  .define('configure', (bot, context, onChange) => {
    store._context = context;
    store._data = {};
    store.onChange = onChange;
  })

  .define('output', () =>
    Object.assign({}, store.get('output'), store._context))

  .define('update', (key, value) => {
    const copy = Object.assign({}, store.get());
    const data = set(copy, key, value);
    const { sessionId } = store;
    if (sessionId) {
      store._data[sessionId] = data;
    } else {
      store._data = data;
    }
    if (/output\./.test(key)) {
      store.onChange(store.output());
    }
  })

  .define('get', key => {
    const { sessionId, _data } = store;
    const data = sessionId ? _data[sessionId] : _data;
    if (key) { return data[key]; }
    return data;
  })

  .define('setSession', id => {
    store.sessionId = id;
    store._data[id] = store._data[id] || {};
  })

  .define('reset', () => {
    const { sessionId } = store;
    if (sessionId) {
      store._data[sessionId] = {};
      return;
    }
    store._data = {};
  })

;
