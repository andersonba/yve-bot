import * as faker from 'faker';
import * as types from '../src/types';

function createMock(obj: Object | Function) {
  return function(custom) {
    let data = obj;
    if (obj instanceof Function) {
      data = obj();
    }
    return Object.assign({}, data, custom);
  };
}

export const RuleOption: (custom?: Object) => types.RuleOption = createMock(() => {
  const word: string = faker.random.word();
  return {
    label: word,
    value: faker.helpers.slugify(word),
    next: faker.database.column(),
  };
});

export const Rule: (custom?: Object) => types.Rule = createMock(() => {
  const options = [];
  options.push(RuleOption());
  options.push(RuleOption());
  options.push(RuleOption());
  return {
    options,
  };
});
