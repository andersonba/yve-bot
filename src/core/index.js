import { set } from 'lodash';
import { RedefineConfigurationError } from './exceptions';

const DEFAULT_OPTS = {
  rule: {
    delay: 1000,
    actions: [],
    preActions: [],
  },
};

class YveBot {
  constructor(rules = []) {
    this.defaults = DEFAULT_OPTS;
    this.rules = rules;
    this.sessionId = null;
    this._store = {};
    this._handlers = {};

    this.controller.configure(this);
    this.on('error', err => {
      throw err;
    });
  }

  on(evt, fn) {
    let handler;
    switch (evt) {
      case 'hear':
      handler = () => fn(this.hear.bind(this));
      break;
    }
    this._handlers[evt] = handler || fn;
    return this;
  }

  store(key) {
    const { sessionId, _store } = this;
    const store = sessionId ? _store[sessionId] : _store;
    if (key) { return store[key]; }
    return store;
  }

  setStore(key, value) {
    const copy = Object.assign({}, this.store());
    const store = set(copy, key, value);
    const { sessionId } = this;
    if (sessionId) {
      this._store[sessionId] = store;
    } else {
      this._store = store;
    }
    if (/data\./.test(key)) {
      this._dispatch('outputChanged', store.data);
    }
  }

  session(id) {
    this.sessionId = id;
    this._store[id] = this._store[id] || {};
    return this;
  }

  start() {
    this._dispatch('start');

    this.controller
      .run(this)
      .catch(e => {
        try {
          this._dispatch('error', e);
        } catch(e) { console.error(e); }
        this.end();
      });

    return this;
  }

  end() {
    this._dispatch('end', this.store('data'));

    const { sessionId } = this;
    if (sessionId) {
      this._store[sessionId] = {};
      return;
    }
    this._store = {};
  }

  talk(message, ctx = {}) {
    const rule = Object.assign({}, this.defaults.rule, ctx);
    this.controller.send(this, message, rule);
  }

  hear(message) {
    this.controller.receive(this, message);
  }

  _dispatch(name, ...args) {
    if (name in this._handlers) {
      this._handlers[name](...args);
    }
  }
}

function register(prop, configure) {
  const obj = {};
  obj.define = (key, fn) => {
    if (key in obj) {
      throw new RedefineConfigurationError(prop, key);
    }
    obj[key] = fn;
    return obj;
  }
  YveBot.prototype[prop] = configure(obj);
}

register('validators', require('./validators'));
register('types', require('./types'));
register('actions', require('./actions'));
register('controller', require('./controller'));

export default YveBot;
