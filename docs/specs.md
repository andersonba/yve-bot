# Yve Bot

A rule based Bot, but intelligent.

Yve to meet her.


## Specs

```
FlowName: String
NextFlow: String [3]
NextFlowStep: String [4]

Root: [Step | Flows]

Flows: Object
+ (FlowName): [Step] [0]
+ exit: Boolean

Step: Object
+ flow: FlowName
+ message: String
+ name: String
+ output: String [8]
+ type: Text | Number | SingleChoice | MultipleChoice
+ replyMessage: String
+ confirmMessage: String
+ next: Next
+ delay: Number [2]
+ sleep: Number [2]
+ options: [Option]
+ validators: [Validator]
+ exit: Boolean

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

Next: Step.name | NextFlow | NextFlowStep | NextRules | NextApi

NextApi: Object
+ api: URL

NextRules: Object
+ rules: RulesConfig

RulesConfig: Object
+ (Step.name): [Rule] [0]

Rule: Object
+ (Validator.keys()): String | Boolean | any [0,1]
+ next: Next
```

  - [0] accepts multiple keys
  - [1] creates an AND condition between the keys
  - [2] in milliseconds
  - [3] format: `flow:{FlowName}`
  - [4] format: `flow:{FlowName}.{Step.name}`
  - [5] warning key is being used as validation error
  - [6] comparation based on type. if array, with length. if string, with total of chars. if number, with difference.
  - [7] if not entered, use the same of value
  - [8] if not entered, use the same of name
  - [9] get the default error message configured in validator
