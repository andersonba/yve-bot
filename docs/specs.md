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

Next: Step.name | NextFlow | NextFlowStep | NextRules

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


## Project
```yaml
core
  runner
  register
    flows
    steps
  modules
    message
      replayMessage
      confirmMessage
    api
    delay
    validators
    types
      text
      number
      single-choice
      multiple-choice

web
  modules
    inputs
      input
      radio
      checkbox
```

## Examples

### 1. chat-server: example
```
bot: Qual área do direito?
user: Direito de Familia
bot: Aguarde momento...
  -> request post
  <- receive new flow
  @ bot runs
bot: Selecione o assunto
  @ bot prints the options
user: Inventário
bot: Obrigado, Anderson. Estou localizando os advogados mais próximos.
  -> request post
  <- receive new flow
  @ bot runs
bot: Enquanto isso, responda algumas perguntas.
```

### 2. organize chat flows
```yaml
flows:
  userInformationsFlow:
  - message: Olá! Você está procurando um advogado?
    delay: 1500
  - message: Bom, primeiro me informe seu nome.
    name: name
    replyMessage: Obrigado por responder, {{name}}!
    validators:
      - required: true

  identifyExpertiseFlow:
  - message: Qual cidade você procura advogado?
    name: expertise
  - message: Pular direto para cá
    name: noExpertise
```

#### 2.1. jump to flow (starts on the first step)
```yaml
- flow: userInformationsFlow
  next: flow:identifyExpertiseFlow
```

#### 2.2. jump to specific step on the flow
```yaml
- flow: userInformationsFlow
  next: flow:identifyExpertiseFlow.noExpertise
```

#### 2.3. jump depending of flow results
```yaml
- flow: userInformationsFlow
  rules:
    - name:
      - regex: ^$
        next: flow:userInformationsFlow.name
    - surname:
      - empty: true
        next: flow:userInformationsFlow.surname
  next: flow:identifyExpertiseFlow.noExpertise
```

#### 2.4. jump depending of flow results [2]
```yaml
- flow: userInformationsFlow
  next:
    rules:
      name:
      - regex: ^$
        next: flow:userInformationsFlow.name
      surname:
      - empty: true
        next: flow:userInformationsFlow.surname
```

#### 2.5. jump to step instead flow
```yaml
- flow: identifyExpertiseFlow
  next: city
- message: Voce nao cai aqui
- message: Qual a cidade? Voce cai aqui
  name: city
```
