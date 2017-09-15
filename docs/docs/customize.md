---
title: Customize types, validators and actions
---

# Customize

Creating custom types, validations and actions for your bot.

## Custom types

Create types of messages that your bot will use. Examples: City and username autocomplete acessing a database.

**Object configuration:**

- **parser** - parses the user's answer
- **transform** - transforms answer with async function
- **validators** - configures the validators

#### Extends

Extends from an existing type

```javascript
bot.types.extend('CustomString', 'String', {
  parser: (answer, rule, bot) => {},
  transform: (answer, rule, bot) => {},
  validators: [],
});
```

#### Define

Create a type from zero

```javascript
bot.types.define('Username', {
  parser: answer => Number(answer),
  transform: answer => fetch('/find-username-by-id', {
    body: JSON.stringify({ id: answer }),
  }),
  validators: [{
    number: true,
    warning: 'Invalid user id'
  }]
});
```

## Custom actions

Create actions that your bot will interact. Examples: Sending email or requesting a hook url.

#### Define

```javascript
bot.actions.define('welcomeEmail', async (actionOptions, bot) => {
  const email = bot.store.get('email');
  const name = bot.store.get('name');
  const title = 'Welcome, ' + name;
  await sendEmail(email, title, actionOptions.templateName);
  return true;
});
```

```yaml
...
- message: Okay! Wait a moment...
  actions:
    - welcomeEmail:
      - templateName: first-step-done.html
```

## Custom validators

Create validators to be used in your messages. Examples: Color picker.

**Object configuration:**

- **validate** - a function to check if is valid
- **warning** - a error message to send to user

#### Define

```javascript
bot.validators.define('email', {
  validate: (expected, answer) => {
    const isEmail = answer.indexOf('@') > 0;
    return isEmail === expected;
  },
  warning: 'A friendly error message',
});
```

[Next: Choosing the bundle]({{ site.baseurl }}/docs/choosing-the-bundle){:.btn}
