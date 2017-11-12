import YveBot from '.';
import { Answer, IIndexes, IRule, RuleNext } from '../types';
import { InvalidAttributeError, PauseRuleTypeExecutors, RuleNotFound, ValidatorError } from './exceptions';
import { sanitizeRule } from './sanitizers';
import * as utils from './utils';

async function validateAnswer(
  answers: Answer | Answer[],
  rule: IRule,
  bot: YveBot,
  executorIndex: number,
) {
  const ruleValidators = rule.validators || [];
  const typeExecutors = bot.types[rule.type].executors || [];
  const currentTypeExecutor = typeExecutors[executorIndex] || {};
  const validators = [].concat(
    executorIndex === 0 ? ruleValidators : [],
    currentTypeExecutor.validators || [],
  );
  const answersList = utils.ensureArray(answers);
  validators.forEach((validator) => {
    Object.keys(validator).forEach((key) => {
      const botValidator = bot.validators[key];
      if (!botValidator || key === 'warning') {
        return;
      }
      const opts = validator[key];
      const isValid = answersList.every(
        (answer) => botValidator.validate(opts, answer, rule, bot),
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
  const ruleNames = (message.match(re) || []).map((s) => s.split('.')[0]);
  Array.from(new Set(ruleNames)).map((ruleName) => {
    const rule = bot.rules[indexes[ruleName]];
    if (!rule || !rule.options.length) { return; }
    const answer = output[ruleName];
    output[ruleName] = (function compile() {
      // multiple choice
      if (answer instanceof Array) {
        return answer
          .map((a) => {
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

function runActions(bot: YveBot, rule: IRule, prop: string): Promise<any> {
  const actions = rule[prop] || [];
  return Promise.all(
    actions.map(async (action) => {
      return Promise.all(
        Object.keys(action).map(async (k) => {
          if (k in bot.actions) {
            return await bot.actions[k](action[k], rule, bot);
          }
          return null;
        }),
      );
    }),
  );
}

function getNextFromIRule(rule: IRule, answer?: Answer | Answer[]): RuleNext | null {
  if (rule.options.length && answer) {
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

function getIRuleByIndex(bot: YveBot, idx: number): IRule {
  const rule = bot.rules[idx] ? bot.rules[idx] : sanitizeRule({ exit: true });
  return Object.assign({}, bot.options.rule, rule);
}

export class Controller {
  private bot: YveBot;
  private _indexes: IIndexes; // tslint:disable-line

  constructor(bot: YveBot) {
    this.bot = bot;
    this._indexes = {};
    this.reindex();
  }

  public reindex(): void {
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

  public async run(idx: number = 0): Promise<this> {
    const { bot } = this;
    const rule = getIRuleByIndex(bot, idx);

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
      return this.nextIRule(rule);
    }

    if (!bot.types[rule.type]) {
      throw new InvalidAttributeError('type', rule);
    }

    bot.store.set('waitingForAnswer', true);
    bot.dispatch('hear');

    return this;
  }

  public async sendMessage(message: string, rule: IRule): Promise<this> {
    const { bot } = this;

    bot.dispatch('typing');

    // typing delay
    if (bot.options.enableWaitForSleep && !rule.exit) {
      if ('delay' in rule) {
        await bot.actions.timeout(rule.delay);
      } else {
        const { timePerChar } = bot.options;
        await bot.actions.timeout(
          utils.calculateDelayToTypeMessage(message, timePerChar),
        );
      }
    }

    const text = compileMessage(bot, message);
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  public async receiveMessage(message: Answer | Answer[]): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = getIRuleByIndex(bot, idx);

    bot.dispatch('listen', message, rule);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer;
    try {
      answer = await this.executeIRuleTypeExecutors(rule, message);
    } catch (e) {
      let expectedError = false;
      if (e instanceof ValidatorError) {
        expectedError = true;
        await this.sendMessage(e.message, rule);
      } else if (e instanceof PauseRuleTypeExecutors) {
        expectedError = true;
        this.incIRuleExecutorIndex(rule);
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
      const replyIRule = Object.assign({}, bot.options.rule);
      await this.sendMessage(rule.replyMessage, replyIRule);
    }

    // run post-actions
    await runActions(bot, rule, 'postActions');

    if (rule.type === 'PassiveLoop') {
      return this;
    }

    return this.nextIRule(rule, answer);
  }

  public jumpByName(ruleName: string): Promise<this> {
    const idx = this._indexes[ruleName];
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, this._indexes);
    }
    return this.run(idx);
  }

  public nextIRule(currentIRule: IRule, answer?: Answer | Answer[]): this {
    const { bot } = this;
    const nextIRuleName = getNextFromIRule(currentIRule, answer);
    if (nextIRuleName) {
      const isJumpToAnotherFlow = nextIRuleName.indexOf('.') > 0;
      const ruleName = isJumpToAnotherFlow ?
        nextIRuleName :
        [currentIRule.flow, nextIRuleName].filter((x) => !!x).join('.');
      this.jumpByName(ruleName);
    } else {
      const nextIdx = bot.store.get('currentIdx') + 1;
      this.run(nextIdx);
    }
    return this;
  }

  private getIRuleExecutorIndex(rule: IRule): number {
    return this.bot.store.get(`executors.${rule.name}.currentIdx`) || 0;
  }

  private incIRuleExecutorIndex(rule: IRule): void {
    this.bot.store.set(
      `executors.${rule.name}.currentIdx`, this.getIRuleExecutorIndex(rule) + 1,
    );
  }

  private resetIRuleExecutorIndex(rule: IRule): void {
    this.bot.store.unset(`executors.${rule.name}.currentIdx`);
  }

  private async executeIRuleTypeExecutors(rule: IRule, lastAnswer: Answer | Answer[]): Promise<Answer | Answer[]> {
    if (!rule.type) {
      return lastAnswer;
    }

    const { bot } = this;
    const executorIdx = this.getIRuleExecutorIndex(rule);
    const executors = bot.types[rule.type].executors || [];

    const executor = executors.slice(executorIdx)[0] || {};
    const { transform = (...args) => Promise.resolve(args[0]) } = executor;
    const answer = await (
      transform(lastAnswer, rule, bot)
      .then((ans) => validateAnswer(ans, rule, bot, this.getIRuleExecutorIndex(rule)))
    );

    const completed = (this.getIRuleExecutorIndex(rule) === executors.length - 1);
    if (executors.length && !completed) {
      this.incIRuleExecutorIndex(rule);
      return await this.executeIRuleTypeExecutors(rule, answer);
    }

    this.resetIRuleExecutorIndex(rule);
    return answer;
  }
}
