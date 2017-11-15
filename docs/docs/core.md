---
title: Core API
---

# Core API

Create your own UI chat conversation or run bots on your backend.

## Initializing
```javascript
import YveBot from 'yve-bot';

const rules = [...];
const options = {
  rule: {
    delay: 5000,
  }
};
const bot = new YveBot(rules, options);
```

| Argument | Default | Type | Description |
|----------|---------|------|-------------|
| rules | - | array[Rule] | Array of Rule
| options.timePerChar | `40` | `number` | Define time per character used in bot typing
| options.enableWaitForSleep | `true` | boolean | Force disable timeout actions (bot typing)
| options.rule | `{}` | Rule | Define default properties of Rule
| options.context | - | Object | Stores user context


## Methods

#### Start

Initialize the conversation

```javascript
bot.start();
```

#### End

Finalize the conversation

```javascript
bot.end();
```

#### Talk

Send message as BOT

```javascript
const message = 'How are you?';
const rule = {
  delay: 4000,
};
bot.talk(message, rule);
```

| Argument | Type | Description |
|----------|------|-------------|
| message | string | Bot's message
| rule | Rule | Message's rule

#### Hear

Reply bot with user's message

```javascript
const message = "I'm ok";
bot.hear(message);
```

| Argument | Type | Description |
|----------|------|-------------|
| message | string, array[string] | User's answer

#### Listen

Configure [Passive mode]({{ site.baseurl }}/docs/passive-mode)
```javascript
bot.listen([ listeners ])
```

#### Session

Set a current session in the instance. It's useful to configure multiple conversations in a node application (eg: socket.io + mongo)

```javascript
const sessionId = socket.id;
const store = getDataFromMongo(sessionId);
bot.session(sessionId, { store });
```

| Argument | Default | Type | Description |
|----------|---------|------|-------------|
| id | - | string | Unique identifier of session
| options.store | `{}` | Object | Uses custom output for this session
| options.rules | `[]` | [Rule] | Uses custom rules for this session
| options.context | - | Object | Uses custom user context for this session


#### AddRule

Add flows and rules dynamically to current chat instance

```javascript
const newRules = [...];  // rules or flows
bot.addRules(newRules);
```

#### Context

Get user context values

```javascript
const ctx = bot.context;
const { uid } = ctx.user;
```


## Binding events

Listen to events and create chat behaviors

#### Start

Event triggered on started conversation

```javascript
bot.on('start', (sessionId) => {
  console.log('Started!');
  ga('send', 'event', 'Chat', 'started');
});
```

#### Talk

Event triggered when the bot talks with you

```javascript
bot.on('talk', (message, rule, sessionId) => {
  console.log('BOT said:', message);

  if (rule.options) {
    console.log('BOT: choose the option');
  }
});
```

#### Typing

Event triggered when bot is typing a message

```javascript
bot.on('typing', (sessionId) => {
  console.log('BOT is typing...');
});
```

#### Typed

Event triggered when bot is typed a message

```javascript
bot.on('typed', (sessionId) => {
  console.log('--');
});
```

#### Error

Event triggered when an error is raised

```javascript
bot.on('error', (err, sessionId) => {
  console.error('Error was found', err);
});
```

#### End

Event triggered when bot terminates the conversation

```javascript
bot.on('end', (output, sessionId) => {
  console.log('Conversation ended');

  fetch('/save', {
    body: JSON.stringify(output),
  });
});
```

[Next: Extensions]({{ site.baseurl }}/docs/extensions){:.btn}
