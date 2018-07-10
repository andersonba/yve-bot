import get from 'lodash-es/get';
import uniq from 'lodash-es/uniq';
import YveBot from '.';
import { Answer, IIndexes, IRule, IRuleOption, RuleNext, IRuleType } from '../types';
import { sanitizeRule } from './sanitizers';

export function compileTemplate(template: string, payload: any): string {
  return template.replace(/{(.*?)}/g, (_, key) => {
    let output = payload;
    for (const prop of key.split('.')) {
      output = output[prop];
    }
    return output || '';
  });
}

export function calculateDelayToTypeMessage(message: string, time: number): number {
  return message.length * time;
}

export function isMatchAnswer(answer: Answer, option: string | number) {
  const sanitizedOption = String(option).toLowerCase();
  const sanitizedAnswer = String(answer).toLowerCase();
  return sanitizedAnswer === sanitizedOption;
}

export function findOptionByAnswer(
  options: IRuleOption[],
  answer: Answer | Answer[],
): IRuleOption {
  const answers: Answer[] = ensureArray(answer);
  const [option] = options
    .filter(
      (o) =>
        answers.some((a) => isMatchAnswer(a, o.value)) ||
        answers.some((a) => isMatchAnswer(a, o.label)) ||
        answers.some((a) => (o.synonyms || []).some((s) => isMatchAnswer(a, s))),
    );
  return option;
}

export function ensureArray(arr) {
  if (typeof arr === 'undefined') {
    return [];
  }
  if (arr instanceof Array) {
    return arr;
  }
  return [arr];
}

export function identifyAnswersInString(
  answer: string,
  options: string[],
): string[] {
  return options.filter((o) =>
    answer.toLowerCase().indexOf(o.toLowerCase()) >= 0,
  );
}

export async function validateAnswer(
  answers: Answer | Answer[],
  rule: IRule,
  bot: YveBot,
  executorIndex: number,
): Promise<Answer | Answer[]> {
  const ruleValidators = ensureArray(rule.validators);
  const typeExecutors = ensureArray(bot.types[rule.type].executors);
  const currentTypeExecutor = get(typeExecutors, executorIndex, {});
  const validators = [].concat(
    executorIndex === 0 ? ruleValidators : [],
    currentTypeExecutor.validators || [],
  );
  const answersList = ensureArray(answers);
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

export function getReplyMessage(rule: IRule, answers: Answer | Answer[]): string | null {
  const { replyMessage } = rule;
  if (!rule.options.length) {
    return replyMessage;
  }
  let opt;
  // multiple
  if (answers instanceof Array) {
    [opt = null] = answers
      .map((a) => findOptionByAnswer(rule.options, a))
      .filter((o) => o.replyMessage) ;
  }
  // single
  opt = findOptionByAnswer(rule.options, answers);
  if (opt && opt.replyMessage) {
    return opt.replyMessage;
  }
  return replyMessage;
}

export function compileMessage(bot: YveBot, message: string): string {
  const output = bot.store.output();
  const { indexes } = bot.controller;
  // extract variable in template: {{ ruleName.X.Y.Z }}
  const re = /(?!\{)\w+[.]((?:\w+[.])*\w+)(?=\})/g;
  const ruleNames = (message.match(re) || []).map((s) => s.split('.')[0]);
  uniq(ruleNames).map((ruleName) => {
    const rule = bot.rules[indexes[ruleName]];
    if (!rule || !rule.options.length) { return; }
    const answer = output[ruleName];
    output[ruleName] = (function compile() {
      // multiple choice
      if (answer instanceof Array) {
        return answer
          .map((a) => {
            const opt = findOptionByAnswer(rule.options, a);
            opt.toString = () => a;
            return opt;
          });
      }
      // single choice
      const option = findOptionByAnswer(rule.options, answer);
      option.toString = () => answer;
      return option;
    }());
  });
  return compileTemplate(message, output).trim();
}

export function runActions(bot: YveBot, rule: IRule, prop: string): Promise<any> {
  const output = bot.store.output();
  const actions = rule[prop] || [];
  return Promise.all(
    actions.map(async (action) => {
      return Promise.all(
        Object.keys(action).map(async (k) => {
          if (k in bot.actions) {
            const value = action[k];

            return await bot.actions[k](
              typeof value === 'string' ? compileTemplate(value, output) : value,
              rule,
              bot,
            );
          }
          return null;
        }),
      );
    }),
  );
}

export function getNextFromRule(rule: IRule, answer?: Answer | Answer[]): RuleNext | null {
  if (rule.options.length && answer !== undefined) {
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

export function getRuleByIndex(bot: YveBot, idx: number): IRule {
  const rule = bot.rules[idx] ? bot.rules[idx] : sanitizeRule({ exit: true });
  return { ...bot.options.rule, ...rule };
}

export function isRuleMessageRequired(bot: YveBot, rule: IRule): boolean {
  if (
    rule.message ||
    !rule.type ||
    !bot.types[rule.type] ||
    typeof bot.types[rule.type].requiredMessage !== 'function'
  ) {
    return !!rule.message;
  }
  return !bot.types[rule.type].requiredMessage(rule);
}
