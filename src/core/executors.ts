import { DefineModule } from './module';
import { PauseRuleTypeExecutors } from './exceptions';
import { Rule, Answer, RuleTypeExecutor } from '../types';


const executors: { [name: string]: RuleTypeExecutor } = {
  WaitForUserInput: {
    validators: [{
      function: (_: Answer, rule: Rule): void => {
        throw new PauseRuleTypeExecutors(rule.name);
      }
    }],
  }
};

export class Executors extends DefineModule {
  public WaitForUserInput: RuleTypeExecutor;

  constructor() {
    super();
    this.define(executors);
  }
}
