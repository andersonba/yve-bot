import 'isomorphic-unfetch';

import YveBot from '../../core';
import { Answer, IRule } from '../../types';

export default YveBot.types.defineExtension('StringSearch', {
  executors: [
    {}, // necessary to read user's input and apply Rule's validators to it
    {
      transform: async (answer: Answer, rule: IRule, bot: YveBot) => {
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
        const { apiURI, apiQueryParam, translate, messages } = rule.config;
        const searchURI = `${apiURI}?${apiQueryParam}=${encodeURIComponent(String(answer))}`;

        bot.dispatch('typing');
        return fetch(searchURI)
          .then((res) => res.json())
          .then((list) => {
            if (list.length === 0) {
              throw new bot.exceptions.ValidatorError(messages.noResults, rule);
            }
            return list;
          })
          .then((list) => {
            if (!translate) {
              return list;
            }
            const { label, value } = translate;
            return list.map((obj) => ({ label: obj[label], value: obj[value] }));
          });
      },
    },
    {
      transform: async (results: any, rule: IRule, bot: YveBot) => {
        const { messages } = rule.config;
        let options;
        let message;
        if (results.length === 1) {
          message = `${messages.didYouMean}: ${results[0].label}?`;
          options = [
            { label: messages.yes, value: results[0].value },
            { label: messages.no, value: null },
          ];
        } else {
          message = `${messages.multipleResults}:`;
          options = results.concat([{
            label: messages.noneOfAbove,
            value: null,
          }]);
        }

        bot.talk(message, { type: 'SingleChoice', options });
        throw new bot.exceptions.PauseRuleTypeExecutors(rule.name);
      },
    },
    {
      validators: [{
        function: (answer: any, rule: IRule, bot: YveBot) => {
          const { messages } = rule.config;
          if (!answer) {
            bot.store.unset(`executors.${rule.name}.currentIdx`);
            bot.talk(messages.wrongResult);
            throw new bot.exceptions.PauseRuleTypeExecutors(rule.name);
          }
          return true;
        },
      }],
    },
  ],
});
