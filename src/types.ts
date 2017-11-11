import { YveBot } from './core/bot';

export interface YveBotOptions {
  timePerChar?: number;
  enableWaitForSleep?: boolean;
  rule?: Rule;
  context?: Context;
}

export interface Flow {
  flow: string;
  rules: Rule[];
}

export interface Rule {
  flow?: string;
  name?: string;
  type?: string;
  output?: string;
  message?: string;
  delay?: number;
  sleep?: number;
  actions?: RuleAction[];
  preActions?: RuleAction[];
  replyMessage?: string;
  options?: RuleOption[];
  validators?: RuleValidator[];
  config?: { [name: string]: any };
  next?: RuleNext;
  exit?: boolean;
}

export interface RuleOption {
  label?: string;
  value?: string | number;
  synonyms?: string[];
  next?: RuleNext;
}

export interface RuleAction {
  [name: string]: any;
}

export interface RuleValidator {
  [name: string]: any;
}

export interface RuleType {
  executors?: RuleTypeExecutor[];
}

export interface RuleTypeExecutor {
  validators?: RuleValidator[];
  transform?: RuleTypeTransform;
}

export type RuleTypeTransform = (
  (value: any, rule?: Rule, bot?: YveBot) => Promise<any>
);

export type RuleNext = string;

export type Context = {
  [key: string]: any;
};

export type Indexes = {
  [ruleName: string]: number;
};

export type Answer = string | number;

export type EventName = 'start' | 'end' | 'error' | 'receive' | 'hear' | 'talk' | 'typed' | 'typing' | 'storeChanged';

export interface ChatOptions {
  target?: string;
  name?: string;
  inputPlaceholder?: string;
  inputPlaceholderSingleChoice?: string;
  inputPlaceholderMutipleChoice?: string;
  doneMultipleChoiceLabel?: string;
  andSeparatorText?: string;
  submitLabel?: string;
  timestampable?: boolean;
  timestampFormatter?: (ts: number) => string;
  autoFocus?: boolean;
  yveBotOptions?: YveBotOptions;
}

export type ChatMessageSource = 'BOT' | 'USER';
