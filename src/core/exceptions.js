function ValidatorError(message, step) {
  this.key = 'validator';
  this.message = message || `Invalid value for "${step.type}" type`;
};

function InvalidAttributeError(type, step) {
  this.key = 'invalidAttribute';
  this.message = `Invalid ${type} attribute "${step.type}"`;
}

function RedefineConfigurationError(type, name) {
  this.key = 'redefineConfiguration';
  this.message = `You can't redefine the "${name}" in ${type}.`;
}

export default {
  ValidatorError,
  InvalidAttributeError,
  RedefineConfigurationError
};
