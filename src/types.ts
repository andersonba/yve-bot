import YveBot from './core';

export interface IYveBotOptions {
  timePerChar?: number;
  enableWaitForSleep?: boolean;
  rule?: IRule;
  context?: IContext;
}

export interface IFlow {
  flow: string;
  rules: IRule[];
}

export interface IRule {
  flow?: string;
  name?: string;
  type?: string;
  output?: string;
  message?: string;
  delay?: number;
  sleep?: number;
  actions?: IRuleAction[];
  preActions?: IRuleAction[];
  replyMessage?: string;
  options?: IRuleOption[];
  validators?: IRuleValidator[];
  config?: { [name: string]: any };
  passive?: boolean;
  next?: RuleNext;
  exit?: boolean;
}

export interface IRuleOption {
  label?: string;
  value?: string | number;
  synonyms?: string[];
  next?: RuleNext;
}

export interface IRuleAction {
  [name: string]: any;
}

export interface IRuleValidator {
  [name: string]: any;
}

export interface IRuleType {
  executors?: IRuleTypeExecutor[];
}

export interface IRuleTypeExecutor {
  validators?: IRuleValidator[];
  transform?: RuleTypeTransform;
}

export type RuleTypeTransform = (
  (value: any, rule?: IRule, bot?: YveBot) => Promise<any>
);

export type RuleNext = string;

export interface IContext {
  [key: string]: any;
}

export interface IIndexes {
  [ruleName: string]: number;
}

export type Answer = string | number;

export interface IListener {
  includes?: RegExp | string | number;
  equals?: string | number;
  regex?: RegExp;
  function?: (answer: string) => boolean;
  passive?: boolean;
  next: RuleNext;
}

export type EventName = 'start' | 'end' | 'error' | 'listen' |
  'hear' | 'talk' | 'reply' | 'typed' | 'typing' | 'storeChanged';

export interface IChatOptions {
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
  yveBotOptions?: IYveBotOptions;
}

export type ChatMessageSource = 'BOT' | 'USER';
