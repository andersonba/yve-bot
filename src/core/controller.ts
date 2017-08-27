import * as format from 'string-template';
import { Rule, RuleNext, RuleContext, Answer } from '../types';
import { YveBot } from './bot';
import { findOptionByAnswer, calculateDelayToTypeMessage } from './utils';
import { ValidatorError, InvalidAttributeError, RuleNotFound } from './exceptions';

function validateAnswer(bot: YveBot, rule: Rule, answer: Answer) {
  const validators = [].concat(
    rule.validators || [],
    bot.types[rule.type].validators || [],
  );
  validators.forEach(obj => {
    Object.keys(obj).forEach(k => {
      const validator = bot.validators[k];
      if (!validator || k === 'warning') { return; }
      if (!validator.validate(obj[k], answer, rule)) {
        const warning = obj.warning || validator.warning;
        const message = typeof warning === 'function' ? warning(obj[k]) : warning;
        throw new ValidatorError(message, rule);
      }
    });
  });
}

function runActions(bot, actions): Promise<any> {
  return Promise.all(actions.map(async action => {
    return Promise.all(Object.keys(action).map(async k => {
      if (k in bot.actions) {
        return await bot.actions[k](action[k], bot);
      }
      return null;
    }));
  }));
}

function getNextFromRule(rule: Rule, answer?: Answer): RuleNext | null {
  if (rule.options && answer) {
    const option = findOptionByAnswer(rule.options, answer);
    if (option && option.next) { return option.next; }
  }
  if (rule.next) { return rule.next; }
  return null;
}

function getRuleContext(rule: Rule): RuleContext {
  const { type, options } = rule;
  const data: RuleContext = { type };
  if (options) {
    data.options = options.map(o => {
      const { label, value } = o;
      return { label, value };
    });
  }
  return data;
}


export class Controller {
  private bot: YveBot;

  constructor(bot: YveBot) {
    bot.store.update('indexes', {});

    bot.rules.forEach((rule, idx) => {
      if (rule.name) {
        bot.store.update(`indexes.${rule.name}`, idx);
      }
    });
    this.bot = bot;
  }

  rule(idx: number): Rule {
    const { bot } = this;
    let rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
    if (typeof rule === 'string') {
      rule = { message: rule };
    }
    return Object.assign({}, bot.defaults.rule, rule);
  }

  async run (idx: number = 0): Promise<this> {
    const { bot } = this;
    bot.store.update('currentIdx', idx);

    const rule = this.rule(idx);

    if (rule.message) {
      await this.send(rule.message, rule);
    }

    // run post-actions
    if (rule.sleep && !rule.exit) {
      await bot.actions.timeout(rule.sleep);
    }
    await runActions(bot, rule.actions);

    if (!rule.type) {
      return this.next(rule);
    }

    if (!bot.types[rule.type]) {
      throw new InvalidAttributeError('type', rule);
    }

    bot.store.update('waitingForAnswer', true);
    bot.dispatch('hear');

    return this;
  }

  async send (message: string, rule: Rule): Promise<this> {
    const { bot } = this;
    bot.dispatch('typing');

    // run pre-actions
    if ('delay' in rule) {
      await bot.actions.timeout(rule.delay);
    } else if (!rule.exit) {
      await bot.actions.timeout(
        calculateDelayToTypeMessage(message) || bot.defaults.rule.delay,
      );
    }
    await runActions(bot, rule.preActions);

    const text = format(message, bot.store.output());
    const ctx = getRuleContext(rule);
    bot.dispatch('talk', text, ctx);

    bot.dispatch('typed');

    return this;
  }

  async receive(message: string): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = this.rule(idx);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer = message;
    if ('parser' in bot.types[rule.type]) {
      answer = bot.types[rule.type].parser(answer);
    }

    try {
      validateAnswer(bot, rule, message);
    } catch(e) {
      if (e instanceof ValidatorError) {
        await this.send(e.message, rule);
        bot.dispatch('hear');
        return this;
      }
      throw e;
    }

    if ('transform' in bot.types[rule.type]) {
      try {
        answer = await bot.types[rule.type].transform(answer, rule, bot);
      } catch(e) {
        bot.dispatch('hear');
        return this;
      }
    }

    bot.store.update('waitingForAnswer', false);

    const output = rule.output || rule.name;
    if (output) {
      bot.store.update(`output.${output}`, answer);
    }

    if (rule.replyMessage) {
      await this.send(rule.replyMessage, rule);
    }

    return this.next(rule, answer);
  }

  jump(ruleName: string): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get(`indexes.${ruleName}`);
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, bot.store.get('indexes'));
    }
    return this.run(idx);
  }

  next(rule: Rule, answer?: Answer): this {
    const { bot } = this;
    if (!rule.exit) {
      const nextRule = getNextFromRule(rule, answer);
      if (nextRule) {
        this.jump(nextRule);
      } else {
        const nextIdx = bot.store.get('currentIdx') + 1;
        if (bot.rules[nextIdx]) {
          this.run(nextIdx);
        }
      }
    } else {
      bot.end();
    }
    return this;
  }
};
