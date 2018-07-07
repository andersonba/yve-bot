import * as faker from 'faker';
import * as types from '../src/types';

function createMock(obj) {
  return (custom) => {
    let data = obj;
    if (obj instanceof Function) {
      data = obj();
    }
    return { ...data, ...custom };
  };
}

export const RuleOption: (custom?: object) => types.RuleOption = createMock(() => {
  const word: string = faker.random.word();
  return {
    label: word,
    next: faker.database.column(),
    value: faker.helpers.slugify(word),
  };
});

export const Rule: (custom?: object) => types.Rule = createMock(() => {
  const options = [];
  options.push(RuleOption());
  options.push(RuleOption());
  options.push(RuleOption());
  return {
    options,
  };
});
