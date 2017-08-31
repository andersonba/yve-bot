import * as format from 'string-template';
import { Rule, RuleNext, Answer, RuleAction, ParsedAnswer } from '../types';
import { YveBot } from './bot';
import { findOptionByAnswer, calculateDelayToTypeMessage } from './utils';
import {
  ValidatorError,
  InvalidAttributeError,
  RuleNotFound,
} from './exceptions';

function validateAnswer(bot: YveBot, rule: Rule, answer: ParsedAnswer) {
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

function runActions(bot: YveBot, actions: RuleAction[]): Promise<any> {
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

function getNextFromRule(rule: Rule, answer?: ParsedAnswer): RuleNext | null {
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

function getRuleByIndex(bot: YveBot, idx: number): Rule {
  const rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
  return Object.assign({}, bot.options.rule, rule);
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
    if (bot.options.enableWaitForSleep && rule.sleep) {
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
    if (bot.options.enableWaitForSleep) {
      if ('delay' in rule) {
        await bot.actions.timeout(rule.delay);
      } else if (!rule.exit) {
        await bot.actions.timeout(
          calculateDelayToTypeMessage(message) || bot.options.rule.delay
        );
      }
    }
    await runActions(bot, rule.preActions);

    const text = format(message, bot.store.output());
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  async receiveMessage(message: Answer): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = getRuleByIndex(bot, idx);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer: ParsedAnswer = message;
    if ('parser' in bot.types[rule.type]) {
      answer = bot.types[rule.type].parser(answer, rule);
    }

    try {
      validateAnswer(bot, rule, answer);
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
        if (e) {
          console.error(e);
        }
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
      const replyRule = Object.assign({}, bot.options.rule);
      await this.sendMessage(rule.replyMessage, replyRule);
    }

    return this.nextRule(rule, answer);
  }

  jumpByName(ruleName: string): Promise<this> {
    const { bot } = this;
    const idx = this.indexes[ruleName];
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, this.indexes);
    }
    return this.run(idx);
  }

  nextRule(currentRule: Rule, answer?: ParsedAnswer): this {
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
