import format from 'string-template';
import { ValidatorError, InvalidAttributeError, RuleNotFound } from './exceptions';
import { findOptionByAnswer } from './utils';

function validateAnswer(bot, rule, answer) {
  const validators = [].concat(
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
    data.options = options.map(o => {
      const { label, value } = o;
      return { label, value };
    });
  }
  return data;
}

export default (ctrl, bot) => ctrl

  .define('configure', () => {
    bot.store.update('indexes', {});

    bot.rules.forEach((rule, idx) => {
      if (rule.name) {
        bot.store.update(`indexes.${rule.name}`, idx);
      }
    });

    return ctrl;
  })

  .define('rule', idx => {
    const rule = bot.rules[idx] ? bot.rules[idx] : { exit: true };
    return Object.assign({}, bot.defaults.rule, rule);
  })

  .define('run', async (idx = 0) => {
    bot.store.update('currentIdx', idx);

    const rule = ctrl.rule(idx);

    if (rule.message) {
      await ctrl.send(rule.message, rule);
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
      return ctrl.next();
    } else if (!bot.types[rule.type]) {
      throw new InvalidAttributeError('type', rule);
    }

    bot.store.update('waitingForAnswer', true);
    bot._dispatch('hear');

    return ctrl;
  })

  .define('send', async (message, rule) => {
    bot._dispatch('typing');

    // run pre-actions
    if (rule.delay && !rule.exit) {
      await bot.actions.timeout(rule.delay);
    }
    await runActions(bot, rule.preActions);

    const text = format(message, bot.store.output());
    const ctx = getRuleContext(rule);
    bot._dispatch('talk', text, ctx);

    bot._dispatch('typed');

    return ctrl;
  })

  .define('receive', async (message) => {
    const idx = bot.store.get('currentIdx');
    const rule = ctrl.rule(idx);

    if (!bot.store.get('waitingForAnswer')) {
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
        await ctrl.send(e.message, rule);
        bot._dispatch('hear');
        return;
      }
      throw e;
    }

    bot.store.update('waitingForAnswer', false);

    const output = rule.output || rule.name;
    if (output) {
      bot.store.update(`output.${output}`, answer);
    }

    if (rule.replyMessage) {
      await ctrl.send(rule.replyMessage, rule);
    }

    const nextRule = getNextFromRule(rule, answer);
    if (nextRule) {
      return ctrl.jump(nextRule);
    }

    if (bot.rules[idx + 1]) {
      return ctrl.next();
    }

    return bot.end();
  })

  .define('jump', ruleName => {
    const idx = bot.store.get(`indexes.${ruleName}`);
    if (typeof idx !== 'number') {
      throw new RuleNotFound(ruleName, bot.store.get('indexes'));
    }
    return ctrl.run(idx);
  })

  .define('next', () => ctrl.run(bot.store.get('currentIdx') + 1))

;
