import { YveBotOptions } from '../types';
export type MessageSource = 'BOT' | 'USER';

export interface ChatOptions {
  target: string;
  inputPlaceholder: string;
  inputPlaceholderSingleChoice: string;
  inputPlaceholderMutipleChoice: string;
  doneMultipleChoiceLabel: string;
  andSeparatorText: string;
  submitLabel: string;
  autoFocus: boolean;
  yveBotOptions?: YveBotOptions;
}
