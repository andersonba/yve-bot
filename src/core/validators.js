function isNumber(v) {
  return /^\d+$/.test(v);
}
function sanitizeLength(answer) {
  return isNumber(answer) ? answer : answer.length;
}

export default validators => validators

    .define('required', {
      validate: (expected, input) => {
        let answer = input;
        if (typeof answer === 'string') {
          answer = answer.trim();
        }
        return Boolean(answer) === expected;
      },
      warning: 'This is required',
    })

    .define('regex', {
      validate: (reg, answer) => new RegExp(reg).test(answer),
      warning: 'Invalid answer format',
    })

    .define('min', {
      validate: (num, answer) => sanitizeLength(answer) >= Number(num),
      warning: min => `This answer length must be min ${min}`,
    })

    .define('max', {
      validate: (num, answer) => sanitizeLength(answer) <= Number(num),
      warning: max => `This answer length must be max ${min}`,
    })

    .define('lenght', {
      validate: (num, answer) => sanitizeLength(answer) === Number(num),
      warning: (num) => `It must have lenght ${num}`,
    })

    .define('string', {
      validate: (expected, answer) =>
        typeof answer === 'string' === expected && !isNumber(answer),
      warning: 'It must be a string',
    })

    .define('number', {
      validate: (expected, answer) => isNumber(answer) === expected,
      warning: 'It must be a number',
    })

    .define('function', {
      validate: (fn, answer, rule) => fn(answer, rule),
      warning: 'Error on execute a validator function',
    })

;
