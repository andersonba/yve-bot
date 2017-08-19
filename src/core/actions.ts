import { YveBotModule } from './utils';

const actions = {
  timeout: (value: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, value))
};

export class Actions extends YveBotModule {
  public timeout: typeof actions.timeout;

  constructor() {
    super();
    this.define(actions);
  }
}
