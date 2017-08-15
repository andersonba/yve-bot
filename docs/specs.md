# Yve Bot

A rule based Bot, but intelligent.

Yve to meet her.


## Specs

```
FlowName: String
Next: Rule.name | NextFlow | NextFlowRule
NextFlow: String [3]
NextFlowRule: String [4]

Root: [Rule | Flows]

Flows: Object
+ (FlowName): [Rule] [0]
+ exit: Boolean

Rule: Object
+ flow: FlowName
+ message: String
+ name: String
+ output: String [8]
+ type: Text | Number | SingleChoice | MultipleChoice
+ replyMessage: String
+ confirmMessage: String
+ delay: Number [2]
+ sleep: Number [2]
+ actions: [Action]
+ preActions: [Action]
+ next: Next
+ options: [Option]
+ validators: [Validator]
+ exit: Boolean

Action: Object
+ (ActionName): any

Option: Object
+ value: (String | Number | any)!
+ label: String [7]
+ next: Next

Validator: Object
+ warning: String [5][9]
+ required: Boolean
+ regex: String
+ number: Boolean
+ string: Boolean
+ min: Number [6]
+ max: Number [6]
+ length: Number [6]
```

  - [0] accepts multiple keys
  - [1] creates an AND condition between the keys
  - [2] in milliseconds
  - [3] format: `flow:{FlowName}`
  - [4] format: `flow:{FlowName}.{Rule.name}`
  - [5] warning key is being used as validation error
  - [6] comparation based on type. if array, with length. if string, with total of chars. if number, with difference.
  - [7] if not entered, use the same of value
  - [8] if not entered, use the same of name
  - [9] get the default error message configured in validator
