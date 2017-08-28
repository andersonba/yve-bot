import * as format from 'string-template';
import { Rule, RuleNext, Answer } from '../types';
import { YveBot } from './bot';
import { findOptionByAnswer, calculateDelayToTypeMessage } from './utils';
import {
  ValidatorError,
  InvalidAttributeError,
  RuleNotFound,
} from './exceptions';

function validateAnswer(bot: YveBot, rule: Rule, answer: Answer) {
  const validators = [].concat(
    rule.validators || [],
    bot.types[rule.type].validators || []
  );
  validators.forEach(obj => {
    Object.keys(obj).forEach(k => {
      const validator = bot.validators[k];
      if (!validator || k === 'warning') {
        return;
      }
      if (!validator.validate(obj[k], answer, rule)) {
        const warning = obj.warning || validator.warning;
        const message =
          typeof warning === 'function' ? warning(obj[k]) : warning;
        throw new ValidatorError(message, rule);
      }
    });
  });
}

function runActions(bot, actions): Promise<any> {
  return Promise.all(
    actions.map(async action => {
      return Promise.all(
        Object.keys(action).map(async k => {
          if (k in bot.actions) {
            return await bot.actions[k](action[k], bot);
          }
          return null;
        })
      );
    })
  );
}

function getNextFromRule(rule: Rule, answer?: Answer): RuleNext | null {
  if (rule.options && answer) {
    const option = findOptionByAnswer(rule.options, answer);
    if (option && option.next) {
      return option.next;
    }
  }
  if (rule.next) {
    return rule.next;
  }
  return null;
}

function getRuleByIndex(bot, idx: number): Rule {
  let rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
  if (typeof rule === 'string') {
    rule = { message: rule };
  }
  return Object.assign({}, bot.defaults.rule, rule);
}

export class Controller {
  private bot: YveBot;
  private indexes: {
    [ruleName: string]: number,
  };

  constructor(bot: YveBot) {
    this.bot = bot;
    this.indexes = {};
    this.reindex();
  }

  reindex(): void {
    const { bot } = this;
    bot.rules.forEach((rule, idx) => {
      if (rule.name) {
        this.indexes[rule.name] = idx;
      }
    });
  }

  async run(idx: number = 0): Promise<this> {
    const { bot } = this;
    const rule = getRuleByIndex(bot, idx);

    bot.store.set('currentIdx', idx);

    if (rule.message) {
      await this.sendMessage(rule.message, rule);
    }

    if (rule.exit) {
      bot.end();
      return this;
    }

    // run post-actions
    if (rule.sleep) {
      await bot.actions.timeout(rule.sleep);
    }
    await runActions(bot, rule.actions);

    if (!rule.type) {
      return this.nextRule(rule);
    }

    if (!bot.types[rule.type]) {
      throw new InvalidAttributeError('type', rule);
    }

    bot.store.set('waitingForAnswer', true);
    bot.dispatch('hear');

    return this;
  }

  async sendMessage(message: string, rule: Rule): Promise<this> {
    const { bot } = this;
    bot.dispatch('typing');

    // run pre-actions
    if ('delay' in rule) {
      await bot.actions.timeout(rule.delay);
    } else if (!rule.exit) {
      await bot.actions.timeout(
        calculateDelayToTypeMessage(message) || bot.defaults.rule.delay
      );
    }
    await runActions(bot, rule.preActions);

    const text = format(message, bot.store.output());
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  async receiveMessage(message: string): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = getRuleByIndex(bot, idx);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer = message;
    if ('parser' in bot.types[rule.type]) {
      answer = bot.types[rule.type].parser(answer);
    }

    try {
      validateAnswer(bot, rule, message);
    } catch (e) {
      if (e instanceof ValidatorError) {
        await this.sendMessage(e.message, rule);
        bot.dispatch('hear');
        return this;
      }
      throw e;
    }

    if ('transform' in bot.types[rule.type]) {
      try {
        answer = await bot.types[rule.type].transform(answer, rule, bot);
      } catch (e) {
        bot.dispatch('hear');
        return this;
      }
    }

    bot.store.set('waitingForAnswer', false);

    const output = rule.output || rule.name;
    if (output) {
      bot.store.set(`output.${output}`, answer);
    }

    if (rule.replyMessage) {
      await this.sendMessage(rule.replyMessage, rule);
    }

    return this.nextRule(rule, answer);
  }

  jumpByName(ruleName: string): Promise<this> {
    const { bot } = this;
    const idx = this.indexes[ruleName];
    if (typeof idx !== 'number') {
      throw RuleNotFound(ruleName, this.indexes);
    }
    return this.run(idx);
  }

  nextRule(currentRule: Rule, answer?: Answer): this {
    const { bot } = this;
    if (!currentRule.exit) {
      const nextRuleName = getNextFromRule(currentRule, answer);
      if (nextRuleName) {
        this.jumpByName(nextRuleName);
      } else {
        const nextIdx = bot.store.get('currentIdx') + 1;
        this.run(nextIdx);
      }
    } else {
      bot.end();
    }
    return this;
  }
}
