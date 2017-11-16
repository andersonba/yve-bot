import '../StringSearch';

import * as fetchMock from 'fetch-mock';

import YveBot from '../../../core';
import { PauseRuleTypeExecutors, ValidatorError } from '../../../core/exceptions';

describe('StringSearch', () => {
  const { executors } = YveBot.types.StringSearch;

  test('properties', () => {
    expect(executors).toHaveLength(4);
    expect(executors[0]).toEqual({});
    expect(executors.slice(-1)[0]).toHaveProperty('validators');
    executors.slice(1, -1).map((exe) => {
      expect(exe).toHaveProperty('transform');
      expect(exe).not.toHaveProperty('validators');
    });
  });

  describe('validators', () => {
    test('last executor', () => {
      const { validators } = executors[3];
      expect(validators).toHaveLength(1);

      const bot = { talk: jest.fn(), store: { unset: jest.fn() } };
      const wrongResult = 'wrongResult msg last-executor-validator';
      const rule = {
        config: { messages: { wrongResult } },
        name: 'testRule',
        rand: Math.random(),
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
        config: { apiURI, apiQueryParam },
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });

      const expectedURI = `${apiURI}?${apiQueryParam}=${encodeURIComponent(input)}`;
      fetchMock.mock(expectedURI, {
        body: [customResponse],
        status: 200,
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
        config: { apiURI, apiQueryParam, translate },
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });

      fetchMock.mock('*', {
        body: [customResponse],
        status: 200,
      });

      const result = await transform(input, rule, bot);
      expect(result).toEqual([customResponse].map((obj) => ({
        label: obj.test1,
        value: obj.test2,
      })));
    });

    test('throw pause executor if response is []', async () => {
      const { transform } = executors[1];
      const input = 'test input';
      const apiURI = 'https://myserver.test/search';
      const apiQueryParam = 'param';
      const translate = { label: 'test1', value: 'test2' };
      const noResults = 'noResults';
      const rule = {
        config: { apiURI, apiQueryParam, translate, messages: { noResults  } },
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });

      fetchMock.mock('*', {
        body: [],
        status: 200,
      });

      await expect(transform(input, rule, bot)).rejects.toEqual(
        new ValidatorError(noResults, rule),
      );
    });

    test('organize server response with 1 result', async () => {
      const serverResponse = { label: 'fake1', value: 'fake2' };

      const { transform } = executors[2];
      const messages = { didYouMean: 'você quis dizer', yes: 'yep', no: 'nope' };
      const rule = {
        config: { messages },
        name: 'customRuleName',
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });
      bot.talk = jest.fn();

      await expect(transform([serverResponse], rule, bot)).rejects.toEqual(
        new PauseRuleTypeExecutors(rule.name),
      );

      expect(bot.talk).toHaveBeenCalled();
      expect(bot.talk).toHaveBeenCalledWith(`${messages.didYouMean}: ${serverResponse.label}?`, {
        options: [
          { label: messages.yes, value: serverResponse.value },
          { label: messages.no, value: null },
        ],
        type: 'SingleChoice',
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
        config: { messages },
        name: 'testRuleName',
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });
      bot.talk = jest.fn();

      await expect(transform(serverResponse, rule, bot)).rejects.toEqual(
        new PauseRuleTypeExecutors(rule.name),
      );

      expect(bot.talk).toHaveBeenCalled();
      expect(bot.talk).toHaveBeenCalledWith(`${messages.multipleResults}:`, {
        options: serverResponse.concat([{
          label: messages.noneOfAbove,
          value: null,
        }]),
        type: 'SingleChoice',
      });
    });

    test('skip transform when it is ran by the second time', async () => {
      const serverResponse = [
        { label: 'label1', value: 'value1' },
        { label: 'label2', value: 'value2' },
      ];

      const { transform } = executors[2];
      const messages = { multipleResults: 'multipleResults', noneOfAbove: 'noneOfAbove' };
      const rule = {
        config: { messages },
        name: 'testRuleName',
        rand: Math.random(),
      };
      const bot = new YveBot([], { rule, enableWaitForSleep: false });
      bot.talk = jest.fn();

      // discard first execution result
      expect(bot.store.get(`stringsearch.${rule.name}`)).toEqual();
      transform(serverResponse, rule, bot);

      const newRand = Math.random();
      expect(bot.store.get(`stringsearch.${rule.name}`)).toEqual({ wait: true });
      expect(await transform(newRand, rule, bot)).toEqual(newRand);

      expect(bot.talk).toHaveBeenCalledTimes(1);
    });
  });
});
