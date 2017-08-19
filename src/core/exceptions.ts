import { Rule } from '../types';

export function ValidatorError(message: string, rule: Rule) {
  this.key = 'validator';
  this.message = message || `Invalid value for "${rule.type}" type`;
};

export function InvalidAttributeError(type: string, rule: Rule) {
  this.key = 'invalidAttribute';
  this.message = `Invalid ${type} attribute "${rule.type}"`;
}

export function RedefineConfigurationError(klass: string, name: string) {
  this.key = 'redefineConfiguration';
  this.message = `You can't redefine the "${name}" in ${klass}.`;
}

export function RuleNotFound(name: string, indexes: string[]) {
  this.key = 'ruleNotFound';
  this.message = `Rule "${name}" not found in indexes`;
  this.indexes = indexes;
};
