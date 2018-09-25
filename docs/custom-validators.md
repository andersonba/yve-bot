---
id: custom-validators
title: Custom validators
---

Create validators to be used in your messages.

Examples: E-mail, color picker, etc.

## Define

```javascript
bot.validators.define('email', {
  validate: (expected, answer) => {
    const isEmail = answer.indexOf('@') > 0;
    return isEmail === expected;
  },
  warning: 'A friendly error message',
});
```

You can also define an asynchronous validation
```javascript
bot.validators.define('external-dep', {
  validate: async (externalAPI, answer) => {
    return fetch(externalAPI).then(result => (answer === result));
  },
  warning: 'A friendly error message',
});
```

## Usage
```yaml
- message: Your e-mail
  validators:
    - email: true
```
