import {
  IFlow,
  IListener,
  IRule,
  IRuleType,
  IRuleTypeExecutor,
} from '../types';

export function sanitizeBotRules(inputs: Array<IFlow | IRule>): IRule[] {
  let rules: IRule[] = [];
  inputs.forEach(input => {
    const isFlow =
      typeof input !== 'string' && 'rules' in input && 'flow' in input;
    if (isFlow) {
      const flow = input as IFlow;
      rules = rules.concat(
        flow.rules.map((rule, idx) => ({
          ...sanitizeRule(rule),
          flow: input.flow,
          flowIdx: idx,
        }))
      );
    } else {
      rules.push(sanitizeRule(input as IRule));
    }
  });
  return rules;
}

export function sanitizeRule(input: IRule): IRule {
  let rule = input;
  if (typeof rule === 'string') {
    rule = { message: rule };
  }
  rule.options = (rule.options || []).map(o => {
    if (typeof o === 'string') {
      return { value: o };
    }
    if (typeof o.synonyms === 'string' && !!o.synonyms) {
      const synonyms: string = o.synonyms;
      o.synonyms = synonyms.split(',').map(s => s.trim());
    }
    return o;
  });

  rule.passive = rule.passive === undefined ? true : rule.passive;
  rule.multiline = rule.multiline === undefined ? true : rule.multiline;

  if (typeof rule.skip === 'undefined') {
    rule.skip = () => false;
  } else if (typeof rule.skip !== 'function') {
    const value = !!rule.skip;
    rule.skip = () => value;
  }

  // string way
  ['actions', 'preActions', 'postActions', 'validators'].forEach(key => {
    function sanitizeInObject(obj) {
      if (obj[key] && obj[key].length) {
        obj[key] = obj[key].map(
          k => (typeof k === 'string' ? { [k]: true } : k)
        );
      }
    }

    sanitizeInObject(rule);

    if (rule.options && rule.options.length) {
      rule.options.forEach(opt => sanitizeInObject(opt));
    }
  });

  return rule;
}

export function sanitizeListener(listener: IListener) {
  const { passive } = listener;
  return {
    ...listener,
    passive: passive || false,
  };
}

export function sanitizeMessage(message: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(message, 'text/html');
  return doc.body.textContent || '';
}

export function sanitizeRuleType(
  ruleType: IRuleType | IRuleTypeExecutor
): IRuleType {
  if (!(ruleType as IRuleType).executors) {
    const {
      transform,
      validators = [],
      ...params
    } = ruleType as IRuleTypeExecutor;
    return {
      executors: [{ transform, validators }],
      ...params,
    };
  }
  return ruleType as IRuleType;
}
