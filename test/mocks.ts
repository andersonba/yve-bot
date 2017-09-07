import * as faker from 'faker';
import * as types from '../src/types';

function createMock(obj: Object | Function) {
  let data = obj;
  if (obj instanceof Function) {
    data = obj();
  }
  return custom => Object.assign({}, obj, custom);
}

export const RuleOption: (custom?: Object) => types.RuleOption = createMock(() => {
  const word: string = faker.random.word();
  return {
    label: word,
    value: faker.helpers.slugify(word),
    next: faker.database.column(),
  };
});
