function ValidatorError(message, rule) {
  this.key = 'validator';
  this.message = message || `Invalid value for "${rule.type}" type`;
};

function InvalidAttributeError(type, rule) {
  this.key = 'invalidAttribute';
  this.message = `Invalid ${type} attribute "${rule.type}"`;
}

function RedefineConfigurationError(type, name) {
  this.key = 'redefineConfiguration';
  this.message = `You can't redefine the "${name}" in ${type}.`;
}

function RuleNotFound(name, indexes) {
  this.key = 'ruleNotFound';
  this.message = `Rule "${name}" not found in indexes`;
  this.indexes = indexes;
};

export default {
  ValidatorError,
  InvalidAttributeError,
  RedefineConfigurationError,
  RuleNotFound,
};
