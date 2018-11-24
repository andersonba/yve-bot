import { DefineModule } from './module';

const actions = {
  timeout: (value: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, value)),
};

export class Actions extends DefineModule {
  public timeout: typeof actions.timeout;

  constructor() {
    super('actions');
    this.define(actions);
  }
}
