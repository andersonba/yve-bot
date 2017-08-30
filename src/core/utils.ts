import { RuleOption, Answer } from '../types';

export function calculateDelayToTypeMessage(message: string): number {
  const timePerChar = 40;
  return (message || '').length * timePerChar;
}

export function findOptionByAnswer(
  options: RuleOption[],
  answer: Answer,
): RuleOption {
  const [option] = options
    .filter(
      o => String(o.value) === answer ||
      String(o.label) === answer
    );
  return option;
}

export function treatAsArray<T>(arr: T | Array<T>): Array<T> {
  if (arr instanceof Array) {
    return arr;
  }
  return [arr];
}
