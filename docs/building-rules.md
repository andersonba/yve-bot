---
id: building-rules
title: Building rules
---

A conversation is defined by an array of Rules. By default, the bot is configured to be rule-based, that is, it will go through all the rules in sequence.

```javascript
const rules = [
  { message: 'Hello!' },
  { message: 'Enter your e-mail', name: 'email', type: 'String' },
];
new YveBot(rules);
```

For better readability, you can use the yaml language to write the rules. See bellow how to use with `js-yaml`:

```yaml
- message: Hello!
- message: Enter your e-mail
  type: String
  name: email
```

```javascript
import yaml from 'js-yaml';
const file = fs.readFileSync('./chat.yaml', 'utf8');
const rules = yaml.safeLoad(file);
new YveBot(rules);
```

*Hint: To avoid `js-yaml` dependency in your bundle, compile the yaml file into a json file in the building step.*

## Compact mode

You can define the message in compact mode
```yaml
- Hello!
- How are you, {name}?
```

## Asking the user

Make some questions to users using `type` property.
```yaml
- message: Hello! What's your email?
  name: email
  type: String
```

See [available types](/docs/api).


## Formatting messages

YveBot has a small template engine to compile the bot messages (supported by `message` or `replyMessage` properties).
You can inject the user’s answers into the messages using:

```yaml
- message: What's your name?
  name: name
  type: String
  replyMessage: Okay {name}, thanks.

- So, {name}. How can I help you?
```

In `SingleChoice` and `MultipleChoice` types, you can inject the option label instead of value, see:

```yaml
- message: Choose a number
  name: number
  type: SingleChoice
  options:
    - label: One
      value: 1
    - label: Two
      value: 2
  replyMessage: You chose number {number.label} (the same of {number})
```

```
> Choose a number
> 1
> You chose number One (the same of 1)
```

See complete specification in [API Reference](api-reference.md).
