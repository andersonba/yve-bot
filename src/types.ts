import { YveBot } from './core/bot';

export type Rule = {
  name?: string;
  type?: string;
  output?: string;
  message?: string;
  delay?: number;
  sleep?: number;
  transform?: (value: string, rule: Rule, bot: YveBot) => Promise<any>,
  actions?: RuleAction[];
  preActions?: RuleAction[];
  replyMessage?: string;
  confirmMessage?: string;
  options?: RuleOption[];
  validators?: RuleValidator[];
  next?: RuleNext;
  exit?: boolean;
}

export type RuleOption = {
  label?: string;
  value?: string | number;
  next?: RuleNext;
};

export type RuleAction = {
  [name: string]: any;
};

export type RuleValidator = {
  [name: string]: any;
};

export type RuleNext = string;

export type Answer = string;
