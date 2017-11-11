import { Rule, RuleNext, Answer, Indexes } from '../types';
import { YveBot } from './bot';
import {
  InvalidAttributeError,
  PauseRuleTypeExecutors,
  RuleNotFound,
  ValidatorError,
} from './exceptions';
import * as utils from './utils';


async function validateAnswer(
  answers: Answer | Answer[],
  rule: Rule,
  bot: YveBot,
  executorIndex: number
) {
  const ruleValidators = rule.validators || [];
  const typeExecutors = (bot.types[rule.type].executors || [{}]);
  const currentTypeExecutor = typeExecutors[executorIndex] || {};
  const validators = [].concat(
    executorIndex === 0 ? ruleValidators : [],
    currentTypeExecutor.validators || []
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
  return answers;
}

function compileMessage(bot: YveBot, message: string): string {
  const output = bot.store.output();
  const { indexes } = bot.controller;
  const re = /(?!\{)\w+[.]((?:\w+[.])*\w+)(?=\})/g; // extract variable in template: {{ ruleName.X.Y.Z }}
  const ruleNames = (message.match(re) || []).map(s => s.split('.')[0]);
  Array.from(new Set(ruleNames)).map(ruleName => {

    const rule = bot.rules[indexes[ruleName]];
    if (!rule || !rule.options) { return; }
    const answer = output[ruleName];
    output[ruleName] = (function() {
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
  private _indexes: Indexes;

  constructor(bot: YveBot) {
    this.bot = bot;
    this._indexes = {};
    this.reindex();
  }

  reindex(): void {
    const { bot } = this;
    bot.rules.forEach((rule, idx) => {
      const { name, flow } = rule;
      if (name) {
        const key = flow ? [flow, name].join('.') : name;
        this._indexes[key] = idx;
      }
    });
  }

  public get indexes() {
    return this._indexes;
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

    // run actions
    await runActions(bot, rule, 'actions');

    if (rule.exit) {
      bot.end();
      return this;
    }

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
        const { timePerChar } = bot.options;
        await bot.actions.timeout(
          utils.calculateDelayToTypeMessage(message, timePerChar)
        );
      }
    }

    const text = compileMessage(bot, message);
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  getRuleExecutorIndex(rule: Rule): number {
    return this.bot.store.get(`executors.${rule.name}.currentIdx`) || 0;
  }

  incRuleExecutorIndex(rule: Rule): void {
    this.bot.store.set(
      `executors.${rule.name}.currentIdx`, this.getRuleExecutorIndex(rule) + 1
    );
  }

  resetRuleExecutorIndex(rule: Rule): void {
    this.bot.store.unset(`executors.${rule.name}.currentIdx`);
  }

  async executeRuleTypeExecutors(rule: Rule, lastAnswer: Answer | Answer[]): Promise<Answer | Answer[]> {
    if (!rule.type) {
      return lastAnswer;
    }

    const { bot } = this;
    const executorIdx = this.getRuleExecutorIndex(rule);
    const executors = bot.types[rule.type].executors || [{}];

    const executor = executors.slice(executorIdx)[0] || {};
    const { transform = (...args) => Promise.resolve(args[0]) } = executor;
    const answer = await (
      transform(lastAnswer, rule, bot)
      .then(answer => validateAnswer(answer, rule, bot, this.getRuleExecutorIndex(rule)))
    );

    const completed = (this.getRuleExecutorIndex(rule) === executors.length-1);
    if (!completed) {
      this.incRuleExecutorIndex(rule);
      return await this.executeRuleTypeExecutors(rule, answer);
    }

    this.resetRuleExecutorIndex(rule);
    return answer;
  }

  async receiveMessage(message: Answer | Answer[]): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = getRuleByIndex(bot, idx);

    bot.dispatch('receive', message, rule);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer;
    try {
      answer = await this.executeRuleTypeExecutors(rule, message);
    } catch (e) {
      let expectedError = false;
      if (e instanceof ValidatorError) {
        expectedError = true;
        await this.sendMessage(e.message, rule);
      } if (e instanceof PauseRuleTypeExecutors) {
        expectedError = true;
        this.incRuleExecutorIndex(rule);
      }

      if (expectedError) {
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

    // run post-actions
    await runActions(bot, rule, 'postActions');

    return this.nextRule(rule, answer);
  }

  jumpByName(ruleName: string): Promise<this> {
    const idx = this._indexes[ruleName];
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, this._indexes);
    }
    return this.run(idx);
  }

  nextRule(currentRule: Rule, answer?: Answer | Answer[]): this {
    const { bot } = this;
    const nextRuleName = getNextFromRule(currentRule, answer);
    if (nextRuleName) {
      const isJumpToAnotherFlow = nextRuleName.indexOf('.') > 0;
      const ruleName = isJumpToAnotherFlow ?
        nextRuleName :
        [currentRule.flow, nextRuleName].filter(x => !!x).join('.');
      this.jumpByName(ruleName);
    } else {
      const nextIdx = bot.store.get('currentIdx') + 1;
      this.run(nextIdx);
    }
    return this;
  }
}
