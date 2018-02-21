import { IFlow, IListener, IRule } from '../types';

export function sanitizeBotRules(inputs: Array<IFlow|IRule>): IRule[] {
  let rules: IRule[] = [];
  inputs.forEach((input) => {
    const isFlow = typeof input !== 'string' && 'rules' in input && 'flow' in input;
    if (isFlow) {
      const flow = input as IFlow;
      rules = rules.concat(
        flow.rules.map(
          (rule) => ({ ...sanitizeRule(rule), flow: input.flow }),
        ),
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
  rule.options = (rule.options || []).map((o) => {
    if (typeof o === 'string') {
      return { value: o };
    }
    if (typeof o.synonyms === 'string' && !!o.synonyms) {
      const synonyms: string = o.synonyms;
      o.synonyms = synonyms.split(',').map((s) => s.trim());
    }
    return o;
  });
  rule.passive = rule.passive === undefined ? true : rule.passive;

  // string way
  ['actions', 'validators'].forEach((key) => {
    if (rule[key] && rule[key].length) {
      rule[key] = rule[key].map((k) => typeof k === 'string' ? {[k]: true} : k);
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
