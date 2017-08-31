import { RuleOption, Answer, ParsedAnswer } from '../types';

export function calculateDelayToTypeMessage(message: string): number {
  const timePerChar = 40;
  return (message || '').length * timePerChar;
}

export function findOptionByAnswer(
  options: RuleOption[],
  answer: ParsedAnswer,
): RuleOption {
  const [option] = options
    .filter(
      o => String(o.value).toLowerCase() === String(answer).toLowerCase() ||
      String(o.label).toLowerCase() === String(answer).toLowerCase()
    );
  return option;
}

export function treatAsArray<T>(arr: T | Array<T>): Array<T> {
  if (arr instanceof Array) {
    return arr;
  }
  return [arr];
}

export function identifyAnswersInString(answer: string, options: string[]): string[] {
  const answers = [];
  options.forEach(opt => {
    if (answer.indexOf(opt) >= 0) {
      answers.push(opt);
    }
  });
  return answers;
}
