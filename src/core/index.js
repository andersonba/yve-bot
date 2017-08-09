import { set } from 'lodash';
import format from 'string-template';
import { RedefineConfigurationError } from './exceptions';

const DEFAULT_OPTS = {
  rule: {
    delay: 1000,
  },
};

class YveBot {
  constructor(rules = []) {
    this.defaults = DEFAULT_OPTS;
    this.rules = rules;
    this.sessionId = null;
    this._store = { };
    this._handlers = {};

    this.controller.configure(this);
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
      return;
    }
    this._store = store;
  }

  session(id) {
    this.sessionId = id;
    this._store[id] = this._store[id] || {};
    return this;
  }

  async start() {
    await this.controller.run(this);
    return this;
  }

  end() {
    this._dispatch('end', this.store().data);

    const { sessionId } = this;
    if (sessionId) {
      this._store[sessionId] = {};
      return;
    }
    this._store = {};
  }

  talk(message) {
    const text = format(message, this.store().data);
    this._dispatch('talk', text);
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
