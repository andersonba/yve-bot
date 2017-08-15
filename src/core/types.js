import { findOptionByAnswer } from './utils';

export default types => types

    .define('Any', {})

    .define('String', {
      parser: v => !!v ? String(v) : '',
      validators: [
        {
          string: true,
          warning: 'Invalid string',
        },
      ]
    })

    .define('Number', {
      parser: v => Number(v),
      validators: [
        {
          number: true,
          warning: 'Invalid number',
        },
      ],
    })

    .define('SingleChoice', {
      validators: [
        {
          function: (value, rule) => !!findOptionByAnswer(rule.options, value),
          warning: 'Unknown option',
        },
      ],
    })

    .define('MultipleChoice', {
      validators: [
        {
          function: (values, rule) => {
            const options = rule.options.map(o => o.value || o.label);
            return [...values].filter(x => !options.includes(x));
          },
          warning: 'Unknown options',
        },
      ],
    });
