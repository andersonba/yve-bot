import { Answer, IRule, IRuleTypeExecutor } from '../types';
import { PauseRuleTypeExecutors } from './exceptions';
import { DefineModule } from './module';

const executors: { [name: string]: IRuleTypeExecutor } = {
  WaitForUserInput: {
    validators: [{
      function: (_: Answer, rule: IRule): void => {
        throw new PauseRuleTypeExecutors(rule.name);
      },
    }],
  },
};

export class Executors extends DefineModule {
  public WaitForUserInput: IRuleTypeExecutor;

  constructor() {
    super('executors');
    this.define(executors);
  }
}
