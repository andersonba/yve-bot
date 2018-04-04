---
id: custom-actions
title: Custom actions
---

Create actions that your bot will interact.

Examples: Sending e-mail or requesting a hook URL.


## How to define

```javascript
bot.actions.define('welcomeEmail', async (actionOptions, bot) => {
  const { title, templateFile } = actionOptions;
  const email = bot.store.get('email');
  const name = bot.store.get('name');
  const body = `Hello, ${name}! Welcome.`;
  await sendEmail(email, title, body, templateFile);
});
```

```yaml
- message: Okay! Wait a moment...
  actions:
    - welcomeEmail:
      - title: Welcome to our site!
        templateName: first-step-done.html
```
