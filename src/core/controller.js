import { concat } from 'lodash';
import { ValidatorError, InvalidAttributeError } from './exceptions';

function sanitizeAnswer(a) {
  return a ? String(a).trim() : a;
}

function validateAnswer(answer, bot, step) {
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
    ctrl.bot = bot;
    return ctrl;
  })

  .define('start', () => {
    return ctrl.run(0);
  })

  .define('end', () => {
    ctrl.bot.end();
    return ctrl;
  })

  .define('jump', stepName => {
    const idx = ctrl.bot._indexes[stepName];
    return ctrl.run(idx);
  })

  .define('next', () => ctrl.run(ctrl.currentIdx + 1))

  .define('run', async (idx) => {
    ctrl.currentIdx = idx;

    const { bot } = ctrl;
    const step = bot.steps[idx];

    if (step.delay) {
      await bot.actions.delay(step.delay);
    }

    if (step.exit) {
      return ctrl.end();
    }

    await bot.talk(step.message);

    if (!step.type) {
      return ctrl.next();
    } else if (!bot.types[step.type]) {
      throw new InvalidAttributeError('type', step);
    }

    let answer = sanitizeAnswer(await bot.hear());
    if ('parser' in bot.types[step.type]) {
      answer = bot.types[step.type].parser(answer);
    }

    try {
      validateAnswer(answer, bot, step);
    } catch(e) {
      if (e instanceof ValidatorError) {
        await bot.talk(e.message);
        return ctrl.run(idx);
      }
      throw e;
    }

    const output = step.output || step.name;
    if (output) {
      bot.store[output] = answer;
    }

    if (step.replyMessage) {
      await bot.talk(step.replyMessage)
    }

    // TODO:
    // - check next in options
    // - check next in flow
    if (step.next) {
      return await ctrl.jump(step.next);
    }

    if (ctrl.bot.steps[ctrl.currentIdx + 1]) {
      return ctrl.next();
    }

    return ctrl.end();
  });
