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

function StepNotFound(idx, steps) {
  this.key = 'stepNotFound';
  this.message = `Step not found at ${idx} index`;
  this.steps = steps;
};

export default {
  ValidatorError,
  InvalidAttributeError,
  RedefineConfigurationError,
  StepNotFound,
};
