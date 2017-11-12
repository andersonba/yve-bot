import { IIndexes, IRule } from '../types';

export function ValidatorError(message: string, rule: IRule) {
  this.key = 'validator';
  this.message = message || `Invalid value for "${rule.type}" type`;
}

export function InvalidAttributeError(type: string, rule: IRule) {
  this.key = 'invalidAttribute';
  this.message = `Invalid ${type} attribute "${rule.type}"`;
}

export function RuleNotFound(name: string, indexes: IIndexes) {
  this.key = 'ruleNotFound';
  this.message = `Rule "${name}" not found in indexes`;
  this.indexes = indexes;
}

export function PauseRuleTypeExecutors(name: string) {
  this.key = 'pauseRuleTypeExecutors';
  this.message = `Rule "${name}" must pause execution`;
}
