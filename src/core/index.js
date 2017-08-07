import promisify from 'es6-promisify';
import nunjucks from 'nunjucks';
import { RedefineConfigurationError } from './exceptions';

class YveBot {
  constructor(steps = []) {
    this.steps = steps;
    this.store = {};
    this._handlers = {};
  }

  on(evt, handler) {
    this._handlers[evt] = handler;
    return this;
  }

  async start() {
    this._trigger('start');
    await this._controller.configure(this).start();
    return this;
  }

  end() {
    this._trigger('end', this.store);
  }

  async talk(message) {
    // TODO: Improves it
    const compiled = nunjucks.renderString(message, this.store);
    return await this._trigger('talk', compiled);
  }

  async hear() {
    return await this._trigger('hear');
  }

  _trigger(name, ...args) {
    if (!this._handlers[name]) { return Promise.resolve(); }
    return promisify(this._handlers[name])(...args);
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
register('_controller', require('./controller'));

export default YveBot;
