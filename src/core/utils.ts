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
