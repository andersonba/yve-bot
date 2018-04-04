---
id: passive-mode
title: Passive mode
---

Configure the bot to jump at any time between the rules using keywords or expressions during the conversation.

Example: A user sends “help” in anytime during the conversation, then the conversation jumps to a specific rule.


## Defining listeners

Combine the `next` property with available checkers: `includes`, `equals`, `regex` and `function`.
```javascript
const listener = { includes: "some text", next: "name_of_rule" };
```

And configure the `listen` method in your bot instance:
```javascript
bot.listen([
  { includes: "help me", next: "help", passive: true },
  { regex: /bye|quit/i, next: "quit", passive: false },
  { function: msg => msg.split(' ').filter(w => w.indexOf('hi')) },
  ...
]);
```

## How to activate
You can define whether you want the bot to stay listening messages during the entire conversation, including questions or not.

- Sets `passive: true` in the listener properties to listen and react at any time in all rules.
- Sets `passive: false` (default) property to listen only to rules of type Passive, see below.

Two types are available to configure Passive mode in your rules:

- **Passive** - Bot waits for user input, If it doesn't match anything, jump to next rule.
- **PassiveLoop** - Bot waits in a loop until a match.


## Examples

### Jumping from any rule
```javascript
bot.listen([
  { includes: /help/i, next: 'help', passive: true },
]);
```
```
bot> What's your name?
user> HELP
(bot jumps without store the "HELP" as answer)
bot> Okay! How can I help you?
```

### Jumping except some rules
```javascript
const rules = [
  { message: "What's your name?", type: 'String', passive: false, name: "name" },  // passive disabled
  { message: "Hello {name}" },
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
bot> Hello quit
bot> What's your email?
user> bye
bot>Bye bye!
```

### Using Passive to starts the bot in passive mode
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

### Using PassiveLoop to block user until find a match
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
