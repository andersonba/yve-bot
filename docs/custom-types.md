---
id: custom-types
title: Custom types
---

Create types of messages that your bot will use as user input.

Examples: City and username autocomplete accessing a database.

## How to define

```javascript
bot.types.define('Username', {
  transform: answer => fetch('/find-username-by-id', {
    body: JSON.stringify({ id: answer }),
  }),
  validators: [{
    number: true,
    warning: 'Invalid user id',
  }],
});
```

## Extending from existing type

```javascript
bot.types.extend('ZipCode', 'Number', {
  transform: (num) => friendlyZip(num),
});
```
