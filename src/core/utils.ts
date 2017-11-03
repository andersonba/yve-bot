import { RuleOption, Answer } from '../types';

export function compileTemplate(template: string, payload: any): string {
	return template.replace(/{(.*?)}/g, (_, key) => {
		let output = payload;
		for (const prop of key.split('.')) {
      output = output[prop];
		}
		return output || '';
	});
}

export function calculateDelayToTypeMessage(message: string, time: number): number {
  return (message || '').length * time;
}

export function isMatchAnswer(answer: Answer, option: string | number) {
  const sanitizedOption = String(option).toLowerCase();
  const sanitizedAnswer = String(answer).toLowerCase();
  return sanitizedAnswer === sanitizedOption;
}

export function findOptionByAnswer(
  options: RuleOption[],
  answer: Answer | Answer[],
): RuleOption {
  const answers: Answer[] = ensureArray(answer);
  const [option] = options
    .filter(
      o =>
        answers.some(a => isMatchAnswer(a, o.value)) ||
        answers.some(a => isMatchAnswer(a, o.label))
    );
  return option;
}

export function ensureArray(arr) {
  if (arr instanceof Array) {
    return arr;
  }
  return [arr];
}

export function identifyAnswersInString(
  answer: string,
  options: string[],
): string[] {
  return options.filter(o =>
    answer.toLowerCase().indexOf(o.toLowerCase()) >= 0
  );
}
