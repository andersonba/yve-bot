import { YveBot } from './core/bot';

export interface YveBotOptions {
  enableWaitForSleep?: boolean;
  rule?: Rule;
}

export interface Rule {
  name?: string;
  type?: string;
  output?: string;
  message?: string;
  delay?: number;
  sleep?: number;
  transform?: (value: string, rule: Rule, bot: YveBot) => Promise<any>;
  actions?: RuleAction[];
  preActions?: RuleAction[];
  replyMessage?: string;
  options?: RuleOption[];
  validators?: RuleValidator[];
  next?: RuleNext;
  exit?: boolean;
}

export interface RuleOption {
  label?: string;
  value?: string | number;
  next?: RuleNext;
}

export interface RuleAction {
  [name: string]: any;
}

export interface RuleValidator {
  [name: string]: any;
}

export type RuleNext = string;

export type Answer = string | number;

export interface ChatOptions {
  target?: string;
  inputPlaceholder?: string;
  inputPlaceholderSingleChoice?: string;
  inputPlaceholderMutipleChoice?: string;
  doneMultipleChoiceLabel?: string;
  andSeparatorText?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  yveBotOptions?: YveBotOptions;
}

export type ChatMessageSource = 'BOT' | 'USER';
