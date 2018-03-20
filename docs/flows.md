---
id: flows
title: Grouping rules
---

To organize your conversation definitions, you can group the rules using the `flow` concept:

```yaml
- flow: identify
  rules:
    - Welcome
    - What's your name?

- flow: ticket
  rules:
    - How can I help you?
```

## Jumping between flows

You can jump between flows using `flow_name.rule_name` notation in the `next` property.

```yaml
- flow: identify
  rules:
    - Welcome!
    - message: Your name?
      name: name
      type: String
    - message: Thanks!
      next: question.help
    - I don't know who you are

- flow: question
  rules:
    - message: How can I help you?
      name: help
```

```
bot> Welcome!
bot> Your name?
user> Anderson
bot> Thanks
bot> How can I help you?
```

This notation is only required if you want to jump to another flow, but you can use just the rule name to jump inside the current flow.

```yaml
- flow: identify
  rules:
    - message: One
      next: two
    - This message will be skipped
    - message: Two
      name: two
      exit: true

- flow: another
  rules:
    - Skipped too
```

```
bot> One
bot> Two
```
