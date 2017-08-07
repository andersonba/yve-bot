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
          function: (value, step) => !!find(step.options, { value }),
          warning: 'Unknown option',
        },
      ],
    })

    .define('MultipleChoice', {
      validators: [
        {
          function: (values, step) => {
            const options = step.options.map(o => o.value);
            return difference(values, options).length;
          },
          warning: 'Unknown options',
        },
      ],
    });
