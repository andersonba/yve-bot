---
title: Rule Specification
---

[Documentation](/docs) / Rule Specification

# Rule
```yaml
# Compact style
- Hello!
- How are you?

# Configurable style
- message: Hello!
  name: welcome
  type: SingleChoice
```

| Property | Default | Type | Description |
|----------|---------|------|-------------|
| name | - | string | Rule name used to jump between rules or to be store in output
| message | - | string | Message to be talk
| output | - | string | Custom key to be stored in output (if empty, the property `name` will be used)
| type | - | string | A pre-defined or user-defined type of user answer. Pre-defined: `String`, `Number`, `SingleChoice`, `MultipleChoice` or `Any`. You can [create a custom type](/docs/core/#custom-types)
| next | - | string | Name of next rule
| delay | `1000` | number | Fake time to simulate a bot typing. By default, the bot calculates this time based on message length and average of typing speed. If entered, the calculation is ignored
| sleep | `0` | number | Fake time to simulate the AFK mode (await from keyboard for a defined time)
| replyMessage | - | string | Auto-reply after user's answer
| options | `[]` | array[[RuleOption](#ruleoption)] | Configuration of answer options used in `SingleChoice` and `MultipleChoice` types
| validators | `[]` | array[[RuleValidator](#rulevalidator)] | Configuration to validate the user answer
| actions | `[]` | array[[RuleAction](#ruleaction)] | Executes an action after bot's message. Pre-defined: `timeout`
| preActions | `[]` | array[[RuleAction](#ruleaction)] | Executes an action before bot's message
| exit | `false` | boolean | Terminates the conversation on this rule
| transform | - | function | Used to create [user-defined type](/docs/core/#custom-types) only

# RuleOption

```yaml
# Compact style
- message: Which colors do you like?
  options:
    - Red
    - Blue

# Configurable style
...
  options:
    - label: Red
      value: red
    - value: blue
    - label: More colors
      next: more_colors
```

| Property | Default | Type | Description |
|----------|---------|------|-------------|
| value | - | string | Value of options stored in output. If empty, returns value of `label` property
| label | - | string | A friendly name shown to user. If empty, returns value of `value` property
| next | - | string | Rule name to jump after user's answer


# RuleValidator

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

[How to create a custom validator?](/docs/core/#custom-validators)

# RuleAction

```yaml
- message: Wait a moment
  actions:
    - timeout: 5000
    - userDefinedAction: http://api/post
```

| Property | Parameter | Description |
|----------|-----------|-------------|
| timeout | number | Executes setTimeout

[How to create a custom action?](/docs/core/#custom-actions)
