import { Rule, RuleNext, Answer } from '../types';
import { YveBot } from './bot';
import { ValidatorError, InvalidAttributeError, RuleNotFound } from './exceptions';
import * as utils from './utils';

async function validateAnswer(
  answers: Answer | Answer[],
  rule: Rule,
  bot: YveBot,
  executorIndex: number
) {
  const ruleValidators = rule.validators || [];
  const typeExecutor = (bot.types[rule.type].executors || [{}])[executorIndex];
  const validators = [].concat(
    executorIndex === 0 ? ruleValidators : [],
    typeExecutor.validators || []
  );
  const answersList = utils.ensureArray(answers);
  validators.forEach(validator => {
    Object.keys(validator).forEach(key => {
      const botValidator = bot.validators[key];
      if (!botValidator || key === 'warning') {
        return;
      }
      const opts = validator[key];
      const isValid = answersList.every(
        answer => botValidator.validate(opts, answer, rule, bot)
      );

      if (!isValid) {
        const warning = validator.warning || botValidator.warning;
        const message = typeof warning === 'function' ? warning(opts) : warning;
        throw new ValidatorError(message, rule);
      }
    });
  });
  return [answers, rule, bot];
}

function compileMessage(bot: YveBot, message: string): string {
  const output = bot.store.output();
  const indexes = bot.controller.getIndexes();
  const re = /(?!\{)\w+[.]((?:\w+[.])*\w+)(?=\})/g;
  const matches = (message.match(re) || []).map(s => s.split('.')[0]);
  Array.from(new Set(matches)).map(key => {
    const rule = bot.rules[indexes[key]];
    if (!rule || !rule.options) { return; }
    const answer = output[key];
    output[key] = (function() {
      // multiple choice
      if (answer instanceof Array) {
        return answer
          .map(a => {
            const opt = utils.findOptionByAnswer(rule.options, a);
            opt.toString = () => a;
            return opt;
          });
      }
      // single choice
      const option = utils.findOptionByAnswer(rule.options, answer);
      option.toString = () => answer;
      return option;
    }());
  });
  return utils.compileTemplate(message, output).trim();
}

function runActions(bot: YveBot, rule: Rule, prop: string): Promise<any> {
  const actions = rule[prop] || [];
  return Promise.all(
    actions.map(async action => {
      return Promise.all(
        Object.keys(action).map(async k => {
          if (k in bot.actions) {
            return await bot.actions[k](action[k], rule, bot);
          }
          return null;
        })
      );
    })
  );
}

function getNextFromRule(rule: Rule, answer?: Answer | Answer[]): RuleNext | null {
  if (rule.options && answer) {
    const option = utils.findOptionByAnswer(rule.options, answer);
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

  getIndexes() {
    return this.indexes;
  }

  async run(idx: number = 0): Promise<this> {
    const { bot } = this;
    const rule = getRuleByIndex(bot, idx);

    bot.store.set('currentIdx', idx);

    // run pre-actions
    if (bot.options.enableWaitForSleep && 'sleep' in rule) {
      await bot.actions.timeout(rule.sleep);
    }
    await runActions(bot, rule, 'preActions');

    if (rule.message) {
      await this.sendMessage(rule.message, rule);
    }

    if (rule.exit) {
      bot.end();
      return this;
    }

    // run post-actions
    await runActions(bot, rule, 'actions');

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

    // typing delay
    if (bot.options.enableWaitForSleep && !rule.exit) {
      if ('delay' in rule) {
        await bot.actions.timeout(rule.delay);
      } else {
        await bot.actions.timeout(
          utils.calculateDelayToTypeMessage(message)
        );
      }
    }

    const text = compileMessage(bot, message);
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  getRuleExecutorIndex(rule: Rule): number {
    return this.bot.store.get(`executors.${rule.name}.index`) || 0;
  }

  async receiveMessage(message: Answer | Answer[]): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = getRuleByIndex(bot, idx);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer;
    const { executors } = bot.types[rule.type];
    const executor = executors[this.getRuleExecutorIndex(rule)] || {};
    const { transform = (...args) => Promise.resolve(args[0]) } = executor;
    try {
      answer = await validateAnswer(
        message, rule, bot, this.getRuleExecutorIndex(rule)
      ).then(args => transform(...args));

      if ( this.getRuleExecutorIndex(rule) < executors.length-1 ) {
        bot.store.set(`executors.${rule.name}.index`, this.getRuleExecutorIndex(rule)+1);
        bot.dispatch('hear');
        return this;
      }

      bot.store.unset(`executors.${rule.name}.index`);
    } catch (e) {
      if (e instanceof ValidatorError) {
        await this.sendMessage(e.message, rule);
        bot.dispatch('hear');
        return this;
      }
      throw e;
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
    const idx = this.indexes[ruleName];
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, this.indexes);
    }
    return this.run(idx);
  }

  nextRule(currentRule: Rule, answer?: Answer | Answer[]): this {
    const { bot } = this;
    const nextRuleName = getNextFromRule(currentRule, answer);
    if (nextRuleName) {
      this.jumpByName(nextRuleName);
    } else {
      const nextIdx = bot.store.get('currentIdx') + 1;
      this.run(nextIdx);
    }
    return this;
  }
}
