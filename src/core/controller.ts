import get from 'lodash-es/get';
import YveBot from '.';
import { Answer, IIndexes, IRule, RuleNext } from '../types';
import { sanitizeRule } from './sanitizers';
import * as utils from './utils';

async function validateAnswer(
  answers: Answer | Answer[],
  rule: IRule,
  bot: YveBot,
  executorIndex: number,
): Promise<Answer | Answer[]> {
  const ruleValidators = utils.ensureArray(rule.validators);
  const typeExecutors = utils.ensureArray(bot.types[rule.type].executors);
  const currentTypeExecutor = get(typeExecutors, executorIndex, {});
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
        throw new bot.exceptions.ValidatorError(message, rule);
      }
    });
  });
  return answers;
}

function getReplyMessage(rule: IRule, answers: Answer | Answer[]): string | null {
  const { replyMessage } = rule;
  if (!rule.options.length) {
    return replyMessage;
  }
  let opt;
  // multiple
  if (answers instanceof Array) {
    [opt = null] = answers
      .map((a) => utils.findOptionByAnswer(rule.options, a))
      .filter((o) => o.replyMessage) ;
  }
  // single
  opt = utils.findOptionByAnswer(rule.options, answers);
  if (opt && opt.replyMessage) {
    return opt.replyMessage;
  }
  return replyMessage;
}

function compileMessage(bot: YveBot, message: string): string {
  const output = bot.store.output();
  const { indexes } = bot.controller;
  // extract variable in template: {{ ruleName.X.Y.Z }}
  const re = /(?!\{)\w+[.]((?:\w+[.])*\w+)(?=\})/g;
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

function getNextFromRule(rule: IRule, answer?: Answer | Answer[]): RuleNext | null {
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

function getRuleByIndex(bot: YveBot, idx: number): IRule {
  const rule = bot.rules[idx] ? bot.rules[idx] : sanitizeRule({ exit: true });
  return { ...bot.options.rule, ...rule };
}

function patchWithTryCatch(ctrl: Controller, cb: (err: Error) => void) {
  const methodsToPatch = ['run', 'receiveMessage'];
  methodsToPatch.forEach((method) => {
    const _method = ctrl[method]; // tslint:disable-line variable-name
    ctrl[method] = async (...args) => {
      try {
        return await _method.call(ctrl, ...args);
      } catch (err) {
        cb(err);
        return ctrl;
      }
    };
  });
}

export class Controller {
  private bot: YveBot;
  private _indexes: IIndexes; // tslint:disable-line variable-name

  constructor(bot: YveBot) {
    this.bot = bot;
    this._indexes = {};
    this.reindex();
    patchWithTryCatch(this, (err) => bot.dispatch('error', err));
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

  public async run(idx: number): Promise<this> {
    const { bot } = this;
    const output = bot.store.output();
    const rule = getRuleByIndex(bot, idx);

    bot.store.set('currentIdx', idx);

    if (rule.skip(output, rule, bot)) {
      return this.nextRule(rule);
    }

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
      throw new bot.exceptions.InvalidAttributeError('type', rule);
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
    const rule = getRuleByIndex(bot, idx);

    bot.dispatch('listen', message, rule);

    if (!bot.store.get('waitingForAnswer')) {
      return this;
    }

    let answer;
    try {
      answer = await this.executeRuleTypeExecutors(rule, message);
    } catch (e) {
      let expectedError = false;
      if (e instanceof bot.exceptions.ValidatorError) {
        expectedError = true;
        await this.sendMessage(e.message, rule);
      } else if (e instanceof bot.exceptions.PauseRuleTypeExecutors) {
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

    const replyMessage = getReplyMessage(rule, answer);
    if (replyMessage) {
      const replyRule = { ...bot.options.rule, delay: rule.delay };
      await this.sendMessage(replyMessage, replyRule);
    }

    // run post-actions
    await runActions(bot, rule, 'postActions');

    if (rule.type === 'PassiveLoop') {
      return this;
    }

    return this.nextRule(rule, answer);
  }

  public jumpByName(ruleName: string): Promise<this> {
    const idx = this._indexes[ruleName];
    if (typeof idx !== 'number') {
      throw new this.bot.exceptions.RuleNotFound(ruleName, this._indexes);
    }
    return this.run(idx);
  }

  public nextRule(currentRule: IRule, answer?: Answer | Answer[]): this {
    const { bot } = this;
    const nextRuleName = getNextFromRule(currentRule, answer);
    if (nextRuleName) {
      let ruleName;
      if (/flow:/.test(nextRuleName)) { // jump to flow
        [ruleName] = Object.keys(bot.controller.indexes)
          .filter((r) => r.startsWith(nextRuleName.split('flow:')[1]));
      } else if (/\./.test(nextRuleName)) { // jump to rule of flow
        ruleName = nextRuleName;
      } else { // jump to rule inside of current flow
        ruleName = [currentRule.flow, nextRuleName]
          .filter((x) => !!x)
          .join('.');
      }
      this.jumpByName(ruleName);
    } else {
      const nextIdx = bot.store.get('currentIdx') + 1;
      this.run(nextIdx);
    }
    return this;
  }

  private getRuleExecutorIndex(rule: IRule): number {
    return this.bot.store.get(`executors.${rule.name}.currentIdx`) || 0;
  }

  private incRuleExecutorIndex(rule: IRule): void {
    this.bot.store.set(
      `executors.${rule.name}.currentIdx`, this.getRuleExecutorIndex(rule) + 1,
    );
  }

  private resetRuleExecutorIndex(rule: IRule): void {
    this.bot.store.unset(`executors.${rule.name}.currentIdx`);
  }

  private async executeRuleTypeExecutors(rule: IRule, lastAnswer: Answer | Answer[]): Promise<Answer | Answer[]> {
    if (!rule.type) {
      return lastAnswer;
    }

    const { bot } = this;
    const executorIdx = this.getRuleExecutorIndex(rule);
    const executors = utils.ensureArray(bot.types[rule.type].executors);

    const executor = get(executors.slice(executorIdx), 0, {});
    const { transform = (...args) => Promise.resolve(args[0]) } = executor;
    const answer = await (
      transform(lastAnswer, rule, bot)
      .then((ans) => validateAnswer(ans, rule, bot, this.getRuleExecutorIndex(rule)))
    );

    const completed = (this.getRuleExecutorIndex(rule) === executors.length - 1);
    if (executors.length && !completed) {
      this.incRuleExecutorIndex(rule);
      return await this.executeRuleTypeExecutors(rule, answer);
    }

    this.resetRuleExecutorIndex(rule);
    return answer;
  }
}
