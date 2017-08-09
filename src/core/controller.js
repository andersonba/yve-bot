import { concat, get, find } from 'lodash';
import { ValidatorError, InvalidAttributeError, StepNotFound } from './exceptions';

function validateAnswer(bot, step, answer) {
  const validators = concat([],
    step.validators || [],
    bot.types[step.type].validators || [],
  );
  validators.forEach(obj => {
    Object.keys(obj).forEach(k => {
      const validator = bot.validators[k];
      if (!validator || k === 'warning') { return; }
      if (!validator.validate(obj[k], answer, step)) {
        const warning = obj.warning || validator.warning;
        const message = typeof warning === 'function' ? warning(obj[k]) : warning;
        throw new ValidatorError(message, step);
      }
    });
  });
}

export default ctrl => ctrl

  .define('configure', bot => {
    ctrl.indexes = {};

    bot.steps.forEach((step, idx) => {
      ctrl.indexes[step.name] = idx;
    });

    return ctrl;
  })

  .define('step', (bot, idx) => {
    if (!bot.steps[idx]) {
      return { exit: true };
    }
    const step = bot.steps[idx];
    return Object.assign({}, bot.defaults.step, step);
  })

  .define('run', async (bot, idx = 0) => {
    bot.setStore('currentIdx', idx);

    const step = ctrl.step(bot, idx);

    if (step.message) {
      await ctrl.send(bot, step.message, step.delay);
    }

    if (step.sleep) {
      await bot.actions.wait(step.sleep);
    }

    if (step.exit) {
      return bot.end();
    }

    if (!step.type) {
      return ctrl.next(bot);
    } else if (!bot.types[step.type]) {
      throw new InvalidAttributeError('type', step);
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
    const step = ctrl.step(bot, idx);

    if (!bot.store('waitingForAnswer')) {
      return;
    }

    let answer = message;
    if ('parser' in bot.types[step.type]) {
      answer = bot.types[step.type].parser(answer);
    }

    try {
      validateAnswer(bot, step, message);
    } catch(e) {
      if (e instanceof ValidatorError) {
        await ctrl.send(bot, e.message, step.delay);
        return;
      }
      throw e;
    }

    bot.setStore('waitingForAnswer', false);

    const output = step.output || step.name;
    if (output) {
      bot.setStore(`data.${output}`, answer);
    }

    if (step.replyMessage) {
      await ctrl.send(bot, step.replyMessage, step.delay);
    }

    // TODO:
    // - check next in options
    // - check next in flow

    const nextStep = step.next || (find(get(step, 'options', []), { value: answer }) || {}).next;
    if (nextStep) {
      return ctrl.jump(bot, nextStep);
    }

    if (bot.steps[idx + 1]) {
      return ctrl.next(bot);
    }

    return bot.end();
  })

  .define('jump', (bot, stepName) => {
    const idx = ctrl.indexes[stepName];
    if (!idx) {
      throw new StepNotFound(stepName);
    }
    return ctrl.run(bot, idx);
  })

  .define('next', bot => ctrl.run(bot, bot.store('currentIdx') + 1))

;
