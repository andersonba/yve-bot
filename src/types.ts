export type Rule = {
  name?: string;
  type?: string;
  output?: string;
  message?: string;
  validators?: RuleValidator[];
  delay?: number;
  sleep?: number;
  actions?: RuleAction[];
  preActions?: RuleAction[];
  replyMessage?: string;
  options?: RuleOption[];
  next?: RuleNext;
  exit?: boolean;
}

export type RuleAction = {

};

export type RuleOption = {
  label?: string;
  value?: string;
  next?: RuleNext;
};

export type RuleValidator = {

};

export type RuleContext = {
  type: string;
  options?: RuleOption[]
};

export type RuleNext = string;

export type Answer = string;
