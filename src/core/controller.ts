import get from 'lodash-es/get';
import YveBot from '.';
import { Answer, IIndexes, IRule, RuleNext } from '../types';
import * as utils from './utils';
import { sanitizeRule } from './sanitizers';

export class Controller {
  private bot: YveBot;
  private _indexes: IIndexes; // tslint:disable-line variable-name

  constructor(bot: YveBot) {
    this.bot = bot;
    this._indexes = {};

    this.reindex();
    patchTryCatch(this, err => bot.dispatch('error', err));
  }

  public reindex(): void {
    const { bot } = this;
    bot.rules.forEach((rule, idx) => {
      const { name, flow } = rule;
      if (flow) {
        this._indexes[[flow, rule.flowIdx].join('.')] = idx;
      }
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
    const rule = utils.getRuleByIndex(bot, idx);

    bot.store.set('currentIdx', idx);

    if (rule.skip(output, rule, bot)) {
      return this.nextRule(rule);
    }

    // run pre-actions
    if (bot.options.enableWaitForSleep && 'sleep' in rule) {
      await bot.actions.timeout(rule.sleep);
    }
    await utils.runActions(bot, rule, 'preActions');

    if (utils.isRuleMessageRequired(bot, rule)) {
      await this.sendMessage(rule.message, rule);
    }

    // run actions
    await utils.runActions(bot, rule, 'actions');

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

  public async sendMessage(input: string | null, rule: IRule): Promise<this> {
    const { bot } = this;
    const message = input || '';

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

    const text = utils.compileMessage(bot, message);
    bot.dispatch('talk', text, rule);
    bot.dispatch('typed');

    return this;
  }

  public async receiveMessage(message: Answer | Answer[]): Promise<this> {
    const { bot } = this;
    const idx = bot.store.get('currentIdx');
    const rule = utils.getRuleByIndex(bot, idx);

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

    const replyMessage = utils.getReplyMessage(rule, answer);
    if (replyMessage) {
      const replyRule = sanitizeRule({ ...bot.options.rule });
      await this.sendMessage(replyMessage, replyRule);
    }

    // run post-actions
    await utils.runActions(bot, rule, 'postActions', answer);

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
    const nextRuleName = utils.getNextFromRule(currentRule, answer);
    if (nextRuleName) {
      let ruleName;
      if (/flow:/.test(nextRuleName)) {
        // jump to flow
        [ruleName] = Object.keys(bot.controller.indexes).filter(r =>
          r.startsWith(nextRuleName.split('flow:')[1])
        );
      } else if (/\./.test(nextRuleName)) {
        // jump to rule of flow
        ruleName = nextRuleName;
      } else {
        // jump to rule inside of current flow
        ruleName = [currentRule.flow, nextRuleName].filter(x => !!x).join('.');
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
      `executors.${rule.name}.currentIdx`,
      this.getRuleExecutorIndex(rule) + 1
    );
  }

  private resetRuleExecutorIndex(rule: IRule): void {
    this.bot.store.unset(`executors.${rule.name}.currentIdx`);
  }

  private async executeRuleTypeExecutors(
    rule: IRule,
    lastAnswer: Answer | Answer[]
  ): Promise<Answer | Answer[]> {
    if (!rule.type) {
      return lastAnswer;
    }

    const { bot } = this;
    const executorIdx = this.getRuleExecutorIndex(rule);
    const executors = utils.ensureArray(bot.types[rule.type].executors);

    const executor = get(executors.slice(executorIdx), 0, {});
    const { transform = (...args) => Promise.resolve(args[0]) } = executor;
    const answer = await transform(lastAnswer, rule, bot).then(ans =>
      utils.validateAnswer(ans, rule, bot, this.getRuleExecutorIndex(rule))
    );

    const completed = this.getRuleExecutorIndex(rule) === executors.length - 1;
    if (executors.length && !completed) {
      this.incRuleExecutorIndex(rule);
      return await this.executeRuleTypeExecutors(rule, answer);
    }

    this.resetRuleExecutorIndex(rule);
    return answer;
  }
}

function patchTryCatch(ctrl: Controller, cb: (err: Error) => void) {
  const methodsToPatch = ['run', 'receiveMessage'];
  methodsToPatch.forEach(method => {
    const methodCopy = ctrl[method];
    ctrl[method] = async (...args) => {
      try {
        return await methodCopy.call(ctrl, ...args);
      } catch (err) {
        cb(err);
        return ctrl;
      }
    };
  });
}
