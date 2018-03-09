---
title: Customize types, validators and actions
---

# Customize

Creating custom types, validations and actions for your bot.

## Custom Types

Create types of messages that your bot will use as user input. Examples: City and username autocomplete acessing a database.

**Object configuration:**
- **transform** - transforms answer with async function
- **validators** - configures the validators

#### Define

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

#### Extends

Extends from an existing type

```javascript
bot.types.extend('ZipCode', 'Number', {
  transform: (num) => friendlyZip(num),
  validators: [],
});
```

## Custom Actions

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

## Custom Validators

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
