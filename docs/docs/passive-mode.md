---
title: Passive mode
---

# Passive mode

Configure your bot to jump at any time between the rules using keywords or expressions during the conversation.

Example: A user sends “help” in anytime during the conversation, then the conversation jumps to a specific rule.

### Defining listeners

Combine the `next` property with available checkers: `includes`, `equals`, `regex` and `function`.
```javascript
const listener = { includes: "help me", next: "name_of_rule" };
```

And configure the `listen` method in your bot instance:
```javascript
bot.listen([
  { includes: "help me", next: "help" },
  { regex: /bye|quit/i, next: "quit" },
  ...
]);
```


### String matching
Jumping based on user input matching
```javascript
const rules = [
  { type: 'Passive' },
  { message: 'Welcome!' },
  { name: 'help', message: 'How can I help you?', type: 'String' },
  ...
];
new YveBot(rules).listen([
  { includes: /help/i, next: 'help' },
  { includes: 'bye', next: 'exit' },
]);
```
```
(no bot activity)
user> hello! I need some help
(bot jumping to "help" rule)
bot> How can I help you?
```

### Custom matching
Create your custom check matching using `function` property.
```javascript
bot.listen([
  {
    function: msg => msg(' ').filter(w => w.indexOf('hi')),
    next: 'help',
  }
]);
```

### Passive types
You can define whether you want the bot to stay listening messages during the entire conversation, including questions or not.

- Sets `passive: true` property to listen and react at any time in all rules.
- Sets `passive: false` (default) property to listen only in rules with passive types, see bellow.

Two types are available to configure you rules in passive mode:

- **Passive** - Bot waits for user input, If it doesn't match anything, jump to next rule.
- **PassiveLoop** - Bot waits in a loop for a match.

#### Example 1 - Jumping from all rules
```javascript
bot.listen([
  { includes: /help/i, next: 'help', passive: true },
]);
```
```
bot> What's your name?
user> HELP
(bot jumping without store the "HELP" as answer)
bot> Okay! How can I help you?
```

#### Example 2 - Do not jump in some rules
```javascript
const rules = [
  { message: "What's your name?", type: 'String', passive: false },  // disable specific rule
  { message: 'Hello' },
  { message: "What's your email?", type: 'String' },
  { message: "Thank you" },
  ...,
  { message: 'Bye bye!', name: 'quit' },
];
bot.listen([
  { includes: /bye/i, next: 'quit', passive: true },
]);
```
```
bot> What's your name?
user> quit
(bot stores "quit" as user answer)
bot> Hello
bot> What's your email?
user> bye
bot>Bye bye!
```

#### Example 2 - Using Passive to starts the bot in passive mode
```javascript
const rules = [
  { type: 'Passive' },
  { message: 'Hi! Welcome to support.' },
  { message: 'Do you have connection issues?', name: 'connection' },
]
...
bot.listen([
  { includes: /connection/i, next: 'connection' },
]);
```
```
(no bot activity)
user> Hi! I need contact to tech support. My connection is slow.
(bot ignores welcome message)
bot> Do you have connection issues?
```

#### Example 3 - Using PassiveLoop to block user until find a match
```javascript
const rules = [
  { type: 'PassiveLoop' },
  { message: 'Okay! How can I help you?', name: 'help' },
]
...
bot.listen([
  { includes: /help/i, next: 'help' },
]);
```
```
(no bot activity)
user> Hi
user> Hello?!
user> Help me!
bot> Okay! How can I help you?
```

[Next: Customize types, validators and actions]({{ site.baseurl }}/docs/customize){:.btn}
