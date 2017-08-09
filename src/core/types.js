import { isEmpty, find, difference } from 'lodash';

export default types => types

    .define('String', {
      parser: v => !isEmpty(v) ? String(v) : '',
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
          function: (value, rule) => !!find(rule.options, { value }),
          warning: 'Unknown option',
        },
      ],
    })

    .define('MultipleChoice', {
      validators: [
        {
          function: (values, rule) => {
            const options = rule.options.map(o => o.value);
            return difference(values, options).length;
          },
          warning: 'Unknown options',
        },
      ],
    });
