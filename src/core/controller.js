import { concat, get, find } from 'lodash';
import promiseRetry from 'promise-retry';
import { ValidatorError, InvalidAttributeError, StepNotFound } from './exceptions';

async function getUserAnswer(bot, step) {
  let answer = await bot.hear();
  if ('parser' in bot.types[step.type]) {
    answer = bot.types[step.type].parser(answer);
  }

  // validation
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

  return answer;
}

export default ctrl => ctrl

  .define('configure', bot => {
    ctrl.bot = bot;
    ctrl.indexes = {};
    ctrl.currentIdx = 0;
    ctrl.reindexSteps();
    return ctrl;
  })

  .define('reindexSteps', () => {
    ctrl.bot.steps.forEach((step, idx) => {
      ctrl.indexes[step.name] = idx;
    });
  })

  .define('start', () => {
    return ctrl.run(0);
  })

  .define('end', () => {
    ctrl.bot.end();
    return ctrl;
  })

  .define('jump', stepName => {
    const idx = ctrl.indexes[stepName];
    return ctrl.run(idx);
  })

  .define('next', () => ctrl.run(ctrl.currentIdx + 1))

  .define('run', async (idx) => {
    ctrl.currentIdx = idx;

    const { bot } = ctrl;
    const step = bot.steps[idx];

    if (!step) {
      throw new StepNotFound(idx, bot.steps);
    }

    if (step.delay) {
      await bot.actions.delay(step.delay);
    }

    if (step.exit) {
      return ctrl.end();
    }

    if (step.message) {
      await bot.talk(step.message);
    }

    if (!step.type) {
      return ctrl.next();
    } else if (!bot.types[step.type]) {
      throw new InvalidAttributeError('type', step);
    }

    const answer = await promiseRetry(async retry => {
      try {
        return await getUserAnswer(bot, step);
      } catch (e) {
        if (e instanceof ValidatorError) {
          await bot.talk(e.message);
          return retry(e)
        }
        throw e;
      }
    }, { factor: 0 });

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

    const nextStep = step.next || (find(get(step, 'options', []), { value: answer }) || {}).next;
    if (nextStep) {
      return await ctrl.jump(nextStep);
    }

    if (ctrl.bot.steps[ctrl.currentIdx + 1]) {
      return ctrl.next();
    }

    return ctrl.end();
  });
