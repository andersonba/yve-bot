import promisify from 'es6-promisify';
import { RedefineConfigurationError } from './exceptions';

class YveBot {
  constructor(steps = []) {
    this.steps = steps;
    this.store = {};
    this._handlers = {};
    this._reindexSteps();
  }

  on(evt, handler) {
    this._handlers[evt] = handler;
    return this;
  }

  start() {
    this._trigger('start');
    this._controller.configure(this).start();
  }

  end() {
    this._trigger('end', this.store);
  }

  async talk(message) {
    return await this._trigger('talk', message);
  }

  async hear() {
    return await this._trigger('hear');
  }

  _trigger(name, ...args) {
    if (!this._handlers[name]) { return Promise.resolve(); }
    return promisify(this._handlers[name])(...args);
  }

 _reindexSteps() {
    this._indexes = {};
    this.steps.forEach((step, idx) => {
      this._indexes[step.name] = idx;
    });
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
