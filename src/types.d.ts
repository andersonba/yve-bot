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
  flowIdx?: number;
  name?: string;
  type?: RuleType;
  output?: string;
  message?: string;
  delay?: number;
  sleep?: number;
  actions?: IRuleAction[];
  preActions?: IRuleAction[];
  postActions?: IRuleAction[];
  replyMessage?: string;
  options?: IRuleOption[];
  maxOptions?: number;
  validators?: IRuleValidator[];
  config?: { [name: string]: any };
  passive?: boolean;
  next?: RuleNext;
  skip?: RuleTypeSkip;
  multiline?: boolean;
  exit?: boolean;
}

export interface IRuleOption {
  label?: string;
  value?: any;
  synonyms?: string[];
  replyMessage?: string;
  next?: RuleNext;
}

export interface IRuleAction {
  [name: string]: any;
}

export interface IRuleValidator {
  [name: string]: any;
}

export interface IRuleType {
  requiredMessage?: (IRule) => boolean;
  executors?: IRuleTypeExecutor[];
}

export interface IRuleTypeExecutor {
  requiredMessage?: (IRule) => boolean;
  validators?: IRuleValidator[];
  transform?: RuleTypeTransform;
}

export type RuleTypeTransform = ((
  value: any,
  rule?: IRule,
  bot?: YveBot
) => Promise<any>);

export type RuleTypeSkip = ((
  output: object,
  rule?: IRule,
  bot?: YveBot
) => boolean);

export type RuleNext = string;

export type RuleActionProp = 'actions' | 'preActions' | 'postActions';

export type RuleType =
  | 'Any'
  | 'Passive'
  | 'PassiveLoop'
  | 'String'
  | 'Number'
  | 'SingleChoice'
  | 'MultipleChoice'
  | 'StringSearch';

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

export type EventName =
  | 'start'
  | 'end'
  | 'error'
  | 'listen'
  | 'hear'
  | 'talk'
  | 'reply'
  | 'typed'
  | 'typing'
  | 'storeChanged';

export type ModuleType =
  | 'validators'
  | 'types'
  | 'actions'
  | 'executors'
  | 'listeners';

export interface IModuleOptions {
  override: boolean;
}

export interface IChatOptions {
  target?: string;
  name?: string;
  inputPlaceholder?: string;
  inputPlaceholderSingleChoice?: string;
  inputPlaceholderMultipleChoice?: string;
  doneMultipleChoiceLabel?: string;
  andSeparatorText?: string;
  submitLabel?: string;
  moreOptionsLabel?: string;
  timestampable?: boolean;
  timestampFormatter?: (ts: number) => string;
  autoFocus?: boolean;
  yveBotOptions?: IYveBotOptions;
}

export type ChatMessageSource = 'BOT' | 'USER';
