import { Actions } from '../actions';

describe('timeout', () => {
  test('common', async () => {
    const now = +new Date();
    await new Actions().timeout(100);
    expect(+new Date() >= now + 100).toBeTruthy();
  });
});
