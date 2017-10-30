import { Types } from '../../types';
import { Executors } from '../../executors';
import { YveBot } from '../../bot';

import * as fetchMock from 'fetch-mock';

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

  describe('transforms', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    test('call server', async () => {
      const customResponse = { rand: Math.random() };

      const { transform } = executors[1];
      const input = 'test input';
      const apiURI = 'https://myserver.test/search';
      const apiQueryParam = 'param';
      const rule = {
        rand: Math.random(),
        config: { apiURI, apiQueryParam },
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });

      const expectedURI = `${apiURI}?${apiQueryParam}=${encodeURIComponent(input)}`;
      fetchMock.mock(expectedURI, {
        status: 200,
        body: [customResponse]
      });

      const result = await transform(input, rule, bot);
      expect(fetchMock.called(expectedURI)).toBeTruthy();
      expect(result).toEqual([customResponse]);
    });

    test('translates server response', async () => {
      const customResponse = { test1: 'fake label', test2: 'fake val' };

      const { transform } = executors[1];
      const input = 'test input';
      const apiURI = 'https://myserver.test/search';
      const apiQueryParam = 'param';
      const translate = { label: 'test1', value: 'test2' };
      const rule = {
        rand: Math.random(),
        config: { apiURI, apiQueryParam, translate },
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });

      fetchMock.mock('*', {
        status: 200,
        body: [customResponse]
      });

      const result = await transform(input, rule, bot);
      expect(result).toEqual([customResponse].map(obj => ({
        value: obj.test2, label: obj.test1
      })));
    });

    test('organize server response with 1 result', async () => {
      const serverResponse = { label: 'fake1', value: 'fake2' };

      const { transform } = executors[2];
      const messages = { didYouMean: 'você quis dizer' };
      const rule = {
        rand: Math.random(),
        config: { messages },
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });
      bot.talk = jest.fn();

      await transform([serverResponse], rule, bot);

      expect(bot.talk).toHaveBeenCalled();
      expect(bot.talk).toHaveBeenCalledWith(`${messages.didYouMean}: ${serverResponse.label}?`, {
        type: 'SingleChoice',
        options: [
          { label: 'Sim', value: serverResponse.value },
          { label: 'Não', value: null },
        ]
      });
    });

    test('organize server response with multiple results', async () => {
      const serverResponse = [
        { label: 'label1', value: 'value1' },
        { label: 'label2', value: 'value2' },
      ];

      const { transform } = executors[2];
      const messages = { multipleResults: 'multipleResults', noneOfAbove: 'noneOfAbove' };
      const rule = {
        rand: Math.random(),
        config: { messages },
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });
      bot.talk = jest.fn();

      await transform(serverResponse, rule, bot);

      expect(bot.talk).toHaveBeenCalled();
      expect(bot.talk).toHaveBeenCalledWith(`${messages.multipleResults}:`, {
        type: 'SingleChoice',
        options: serverResponse.concat([{
          label: messages.noneOfAbove,
          value: null,
        }])
      });
    });
  });
});
