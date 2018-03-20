---
id: api-rule
title: Rule specification
---

```yaml
# Compact
- Hello!
- How are you, {name}?

# Customizable
- message: Hello! What's your name?
  name: name
  type: String
  replyMessage: Welcome, {name}!
```

| Property | Default | Type | Description |
|----------|---------|------|-------------|
| name | - | string | Rule name used to jump between rules or to be store in output
| message | - | string | Message to be talk
| output | - | string | Custom key to be stored in output (if empty, the property *name* will be used)
| type | - | string | A pre-defined or user-defined type of user answer. Pre-defined:<br/>`String`, `Number`, `SingleChoice`, `MultipleChoice`, [`Passive`](passive-mode.md), [`PassiveLoop`](passive-mode.md) or `Any`.<br/>Check out the [extensions](extensions.md)
| next | - | string | Name of next rule
| delay | - | number | Force a fake time milliseconds to simulate a bot typing.<br/>By default, the bot calculates this time based on message length and average of typing speed.
| sleep | `0` | number | Fake time to simulate the AFK mode (await from keyboard for a defined time)
| replyMessage | - | string | Auto-reply after user's answer ([formatting message](#formattedmessage))
| options | `[]` | array[[RuleOption](#ruleoption)] | Configuration of answer options used in `SingleChoice` and `MultipleChoice` types
| maxOptions | - | number | Paginate the options above, limiting by max per page. UI bundle only.
| validators | `[]` | array[[RuleValidator](#rulevalidator)] | Configuration to validate the user answer in the first executor
| passive | true | boolean | Force disable [Passive mode](passive-mode.md) in this rule only
| actions | `[]` | array[[RuleAction](#ruleaction)] | Executes an action after bot's message
| preActions | `[]` | array[[RuleAction](#ruleaction)] | Executes an action before bot's message
| postActions | `[]` | array[[RuleAction](#ruleaction)] | Executes an action after user's answer
| skip | `false` | boolean or `(output, rule, bot) => boolean` | Skip rule based on conditional function
| multiline | `true` | boolean | Enable multiline input text, otherwise use single line input
| exit | `false` | boolean | Terminates the conversation on this rule


## RuleOption

```yaml
# Compact
- message: Which colors do you like?
  options:
    - Red
    - Blue

# Customizable
- message: Which colors do you like?
  options:
    - label: Red
      value: red
    - value: blue
    - label: More colors
      synonyms: more, others
      next: more_colors
```

| Property | Default | Type | Description |
|----------|---------|------|-------------|
| value | - | string | Value of options stored in output. If empty, returns value of `label` property
| label | - | string | A friendly name shown to user. If empty, returns value of `value` property
| synonyms | - | string or string[] | A comma-separated or an array of synonyms to be considered in answer
| next | - | string | Rule name to jump after user's answer


## RuleValidator

```yaml
- message: What is your email?
  validators:
    - email: true
    - userDefinedValidator: true
```

| Property | Expected | Description |
|----------|----------|-------------|
| required | boolean | Assert non-empty value
| regex | string | Test with regex
| minWords | number | Assert minimum of words
| maxWords | number | Assert maximum of words
| min | number | Assert minimum of characters
| max | number | Assert maximum of characters
| length | number | Assert has exactly length
| string | boolean | Assert answer is string
| number | boolean | Assert answer is number
| email | boolean | Assert answer is email
| function | function | Assert result of function


## RuleAction

```yaml
- message: Wait a moment
  actions:
    - timeout: 5000
    - userDefinedAction: http://api/post
```

| Property | Parameter | Description |
|----------|-----------|-------------|
| timeout | number | Executes setTimeout
