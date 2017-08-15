import format from 'string-template';
import { concat, get, pick } from 'lodash';
import { ValidatorError, InvalidAttributeError, RuleNotFound } from './exceptions';
import { findOptionByAnswer } from './utils';

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

function runActions(bot, actions) {
  return Promise.all(actions.map(async action => {
    return Promise.all(Object.keys(action).map(async k => {
      if (k in bot.actions) {
        return await bot.actions[k](action[k], bot);
      }
      return null;
    }));
  }));
}

function getNextFromRule(rule, answer) {
  if (rule.options) {
    const { next }  = findOptionByAnswer(rule.options, answer) || {};
    if (next) { return next; }
  }
  if (rule.next) { return rule.next; }
  return null;
}

function getRuleContext(rule) {
  const { type, options } = rule;
  const data = { type };
  if (options) {
    data.options = options.map(o => pick(o, ['label', 'value']));
  }
  return data;
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
    const rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
    return Object.assign({}, bot.defaults.rule, rule);
  })

  .define('run', async (bot, idx = 0) => {
    bot.setStore('currentIdx', idx);

    const rule = ctrl.rule(bot, idx);

    if (rule.message) {
      await ctrl.send(bot, rule.message, rule);
    }

    // run post-actions
    if (rule.sleep && !rule.exit) {
      await bot.actions.timeout(rule.sleep);
    }
    await runActions(bot, rule.actions);

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

  .define('send', async (bot, message, rule) => {
    bot._dispatch('typing');

    // run pre-actions
    if (rule.delay && !rule.exit) {
      await bot.actions.timeout(rule.delay);
    }
    await runActions(bot, rule.preActions);

    const text = format(message, bot.store('data'));
    const ctx = getRuleContext(rule);
    bot._dispatch('talk', text, ctx);

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
        await ctrl.send(bot, e.message, rule);
        bot._dispatch('hear');
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
      await ctrl.send(bot, rule.replyMessage, rule);
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
    if (!ruleName in ctrl.indexes) {
      throw new RuleNotFound(ruleName);
    }
    const idx = ctrl.indexes[ruleName];
    return ctrl.run(bot, idx);
  })

  .define('next', bot => ctrl.run(bot, bot.store('currentIdx') + 1))

;
