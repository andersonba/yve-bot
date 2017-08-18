import { RedefineConfigurationError } from './exceptions';

const DEFAULT_OPTS = {
  rule: {
    delay: 1000,
    actions: [],
    preActions: [],
  },
};

class YveBot {
  constructor(rules = [], context = {}) {
    this.defaults = DEFAULT_OPTS;
    this.rules = rules;
    this._handlers = {};
    this._store = {
      context,
    };

    register(this, 'store', require('./store'));
    register(this, 'controller', require('./controller'));
    this.controller.configure();

    this.on('error', err => { throw err; });
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

  session(id) {
    const copy = new YveBot();
    copy.sessionId = id;
    copy.rules = this.rules;
    copy._handlers = this._handlers;
    copy._store = Object.assign({}, this._store);
    return copy;
  }

  start() {
    this._dispatch('start');

    this.controller.run()
      .catch(this._catch.bind(this));

    return this;
  }

  end() {
    this._dispatch('end', this.store.output());
  }

  talk(message, ctx = {}) {
    const rule = Object.assign({}, this.defaults.rule, ctx);
    this.controller.send(message, rule);
  }

  hear(message) {
    this.controller.receive(message)
      .catch(this._catch.bind(this));
  }

  _dispatch(name, ...args) {
    if (name in this._handlers) {
      this._handlers[name](...args, this.sessionId);
    }
  }

  _catch(err) {
    try {
      this._dispatch('error', err);
    } catch(e) { console.error(e); }
    this.end();
  }
}

function register(target, prop, configure) {
  const obj = {};
  obj.define = (key, fn) => {
    if (key in obj) {
      throw new RedefineConfigurationError(prop, key);
    }
    obj[key] = fn;
    return obj;
  }
  target[prop] = configure(obj, target);
}

register(YveBot.prototype, 'validators', require('./validators'));
register(YveBot.prototype, 'types', require('./types'));
register(YveBot.prototype, 'actions', require('./actions'));

export default YveBot;
