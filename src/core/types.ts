import fetch = require('fetch-everywhere');

import { uniq } from 'lodash';

import { DefineModule } from './module';
import { ValidatorError } from './exceptions';
import { Executors } from './executors';
import { YveBot } from './bot';
import * as utils from './utils';

import { Rule, Answer, RuleType } from '../types';


const executors = new Executors;


const types: { [name: string]: RuleType } = {
  Any: { executors: [{}] },

  String: {
    executors: [{
      transform: async (value: Answer) => String(value),
      validators: [
        {
          string: true,
          warning: 'Invalid string',
        },
      ],
    }],
  },

  Number: {
    executors: [{
      transform: async (value: Answer) => Number(value),
      validators: [
        {
          number: true,
          warning: 'Invalid number',
        },
      ],
    }],
  },

  SingleChoice: {
    executors: [{
      transform: async (value: Answer | Answer[], rule: Rule) => {
        const option = utils.findOptionByAnswer(rule.options, value);
        if (!option) {
          return undefined;
        }
        return option.value || option.label;
      },
      validators: [
        {
          function: (answer: Answer | Answer[], rule: Rule) =>
            !!utils.findOptionByAnswer(rule.options, answer),
          warning: 'Unknown option',
        },
      ],
    }],
  },

  MultipleChoice: {
    executors: [{
      transform: async (answer: Answer | Answer[], rule: Rule) => {
        let values;
        if (answer instanceof Array) {
          values = answer;
        } else {
          const options = rule.options.map(o => String(o.value || o.label));
          values = utils.identifyAnswersInString(String(answer), options);
        }
        return uniq(values
          .map(value => {
            const option = utils.findOptionByAnswer(rule.options, value);
            if (!option) {
              return undefined;
            }
            return option.value || option.label;
          })
          .filter(x => x));
      },
      validators: [
        {
          function: (answer: Answer | Answer[], rule: Rule) => {
            const answers = utils.ensureArray(answer);
            const options = rule.options.map(o => String(o.value || o.label));
            return answers.every(a => options.some(o => utils.isMatchAnswer(a, o)));
          },
          warning: 'Unknown options',
        },
      ],
    }],
  },

  StringSearch: {
    executors: [
      {}, // necessary to read user's input and apply Rule's validators to it
      {
        transform: async (answer: Answer, rule: Rule, bot: YveBot) => {
          /*
           * Server MUST return a JSON with a list of objects following the format:
           * [
           *   { label: String, value: Any }
           * ]
           * Or you will need to set rule.config.translate object with your
           * server response's objects properties to this expected format
           * - translate:
           *   - label: myProperty1
           *   - value: myProperty2
           */
          const { apiURI, apiQueryParam, translate } = rule.config;
          const searchURI = `${apiURI}?${apiQueryParam}=${encodeURIComponent(String(answer))}`;

          bot.dispatch('typing');
          return fetch(searchURI)
            .then(res => res.json())
            .then(list => {
              if (!translate) {
                return list;
              }
              const { label, value } = translate;
              return list.map(obj => ({ label: obj[label], value: obj[value] }));
            });
        },
        validators: [{
          function: (results: any, rule: Rule) => {
            if (results.length === 0) {
              throw new ValidatorError(rule.config.messages.noResults, rule);
            }
            return true;
          }
        }]
      },
      {
        transform: async (results: any, rule: Rule, bot: YveBot) => {
          const { messages } = rule.config;
          let options, message;
          if (results.length === 1) {
            message = `${messages.didYouMean}: ${results[0].label}?`;
            options = [
              { label: 'Sim', value: results[0].value },
              { label: 'Não', value: null },
            ];
          } else {
            message = `${messages.multipleResults}:`;
            options = results.concat([{
              label: messages.noneOfAbove,
              value: null,
            }]);
          }

          bot.talk(message, { type: 'SingleChoice', options });
        },
        validators: [...executors.WaitForUserInput.validators]
      },
      {
        validators: [{
          function: (answer: any, rule: Rule, bot: YveBot) => {
            const { messages } = rule.config;
            if (!answer) {
              bot.store.unset(`executors.${rule.name}.currentIdx`);
              bot.talk(messages.wrongResult);
              return (
                executors.WaitForUserInput.validators
                  .reduce((list, validator) => list.concat(
                    Object.keys(validator).map(k => validator[k])
                  ), [])
                  .filter(validator => validator instanceof Function)
                  .every(validator => validator('', rule))
              );
            }
            return true;
          }
        }]
      }
    ],
  }
};

export class Types extends DefineModule {
  public Any: RuleType;
  public String: RuleType;
  public Number: RuleType;
  public SingleChoice: RuleType;
  public MultipleChoice: RuleType;
  public StringSearch: RuleType;

  constructor() {
    super();
    this.define(types);
  }
}
