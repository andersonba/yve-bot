import { concat, get, find } from 'lodash';
import { ValidatorError, InvalidAttributeError, RuleNotFound } from './exceptions';

function validateAnswer(bot, rule, answer) {
  const validators = concat([],
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

function getNextFromRule(rule, answer) {
  if (rule.next) { return rule.next; }
  if (rule.options) {
    const { next } = find(rule.options, { answer }) || {};
    if (next) { return next; }
  }
  // TODO: find in flow
  return null;
}

export default ctrl => ctrl

  .define('configure', bot => {
    ctrl.indexes = {};

    bot.rules.forEach((rule, idx) => {
      ctrl.indexes[rule.name] = idx;
    });

    return ctrl;
  })

  .define('rule', (bot, idx) => {
    if (!bot.rules[idx]) {
      return { exit: true };
    }
    const rule = bot.rules[idx];
    return Object.assign({}, bot.defaults.rule, rule);
  })

  .define('run', async (bot, idx = 0) => {
    bot.setStore('currentIdx', idx);

    const rule = ctrl.rule(bot, idx);

    if (rule.message) {
      await ctrl.send(bot, rule.message, rule.delay);
    }

    if (rule.sleep) {
      await bot.actions.wait(rule.sleep);
    }

    if (rule.exit) {
      return bot.end();
    }

    if (!rule.type) {
      return ctrl.next(bot);
    } else if (!bot.types[rule.type]) {
      throw new InvalidAttributeError('type', rule);
    }

    bot.setStore('waitingForAnswer', true);
    bot._dispatch('hear');

    return ctrl;
  })

  .define('send', async (bot, message, delay) => {
    bot._dispatch('typing');

    if (delay) {
      await bot.actions.wait(delay);
    }

    bot.talk(message);
    bot._dispatch('typed');
  })

  .define('receive', async (bot, message) => {
    const idx = bot.store('currentIdx');
    const rule = ctrl.rule(bot, idx);

    if (!bot.store('waitingForAnswer')) {
      return;
    }

    let answer = message;
    if ('parser' in bot.types[rule.type]) {
      answer = bot.types[rule.type].parser(answer);
    }

    try {
      validateAnswer(bot, rule, message);
    } catch(e) {
      if (e instanceof ValidatorError) {
        await ctrl.send(bot, e.message, rule.delay);
        return;
      }
      throw e;
    }

    bot.setStore('waitingForAnswer', false);

    const output = rule.output || rule.name;
    if (output) {
      bot.setStore(`data.${output}`, answer);
    }

    if (rule.replyMessage) {
      await ctrl.send(bot, rule.replyMessage, rule.delay);
    }

    const nextRule = getNextFromRule(rule, answer);
    if (nextRule) {
      return ctrl.jump(bot, nextRule);
    }

    if (bot.rules[idx + 1]) {
      return ctrl.next(bot);
    }

    return bot.end();
  })

  .define('jump', (bot, ruleName) => {
    const idx = ctrl.indexes[ruleName];
    if (!idx) {
      throw new RuleNotFound(ruleName);
    }
    return ctrl.run(bot, idx);
  })

  .define('next', bot => ctrl.run(bot, bot.store('currentIdx') + 1))

;
