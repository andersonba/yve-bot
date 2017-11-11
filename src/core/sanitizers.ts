import { Flow, Rule } from '../types';

export function sanitizeBotRules(inputs: (Flow|Rule)[]): Rule[] {
  let rules: Rule[] = [];
  inputs.forEach(input => {
    const isFlow = typeof input !== 'string' && 'rules' in input && 'flow' in input;
    if (isFlow) {
      const flow = input as Flow;
      rules = rules.concat(
        flow.rules.map(
          rule => Object.assign({}, sanitizeRule(rule), {
            flow: input.flow,
          })
        )
      );
    } else {
      rules.push(sanitizeRule(input as Rule));
    }
  });
  return rules;
}

export function sanitizeRule(input: Rule): Rule {
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
  return rule;
}
