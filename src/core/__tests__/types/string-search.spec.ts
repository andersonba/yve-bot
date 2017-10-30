import { Types } from '../../types';
import { Executors } from '../../executors';


describe('StringSearch', () => {
  const { executors } = (new Types).StringSearch;

  test('properties', () => {
    expect(executors).toHaveLength(4);
    expect(executors[0]).toEqual({});
    executors.slice(1).map(exe => {
      expect(exe).toHaveProperty('validators');
    });
    executors.slice(1, -1).map(exe => {
      expect(exe).toHaveProperty('transform');
    });
  });

  describe('validators', () => {
    test('first executor', () => {
      const { validators } = executors[1];
      expect(validators).toHaveLength(1);

      const noResults = 'noResults msg first-executor-validator';
      const rule = {
        rand: Math.random(),
        config: { messages: { noResults } }
      };
      const { function: validator } = validators[0];
      const validate = (result) => validator(result, rule);

      expect(validate([1])).toBeTruthy();
      expect(() => validate([])).toThrowErrorMatchingSnapshot();
    });

    test('wait for input executor', () => {
      const { validators } = executors[2];
      expect(validators).toEqual((new Executors).WaitForUserInput.validators);
    });

    test('last executor', () => {
      const { validators } = executors[3];
      expect(validators).toHaveLength(1);

      const bot = { talk: jest.fn(), store: { unset: jest.fn() } };
      const wrongResult = 'wrongResult msg last-executor-validator';
      const rule = {
        name: 'testRule',
        rand: Math.random(),
        config: { messages: { wrongResult } }
      };

      const { function: validator } = validators[0];
      expect(validator('something', rule, bot)).toBeTruthy();
      expect(bot.talk).not.toHaveBeenCalled();
      expect(bot.store.unset).not.toHaveBeenCalled();

      expect(() => validator(null, rule, bot)).toThrowErrorMatchingSnapshot();
      expect(bot.talk).toHaveBeenCalledWith(wrongResult);
      expect(bot.store.unset).toHaveBeenCalledWith(`executors.${rule.name}.currentIdx`);
    });
  });
});
