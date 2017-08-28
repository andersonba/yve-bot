# YveBot Specs

### Rule
```
{
  message?: String
  name?: String
  output?: String
  type?: RuleType
  replyMessage?: String
  delay?: Number
  sleep?: Number
  actions?: [RuleAction]
  preActions?: [RuleAction]
  next?: String
  options?: [RuleOption]
  validators?: [RuleValidator]
  exit?: Boolean
}
```

### RuleType
```
String | Number | SingleChoice | MultipleChoice
```

### RuleAction
```
{
  (name: string): any
}
```

### RuleOption
```
{
  value: String | Number | any
  label?: String
  next?: String
}
```

### RuleValidator
```
{
  warning?: String
  required?: Boolean
  regex?: String
  number?: Boolean
  string?: Boolean
  min?: Number
  max?: Number
  length?: Number
}
```
