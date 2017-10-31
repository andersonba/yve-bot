---
title: UI API
---

# UI API

Create bots without re-implement the chat conversation UI components. This browser lib is a wrapper over the Core bundle.

## Initializing
```html
<script src="destination/to/yve-bot/ui.js"></script>

<script>
  var rules = [...];
  var chatOptions = {
    target: '.Chat',
    submitLabel: 'Send'
  };
  var bot = new YveBot(rules, chatOptions);
</script>
```

| Argument | Default | Type | Description |
|----------|---------|------|-------------|
| rules | - | array[Rule] | Array of Rule
| options.target | `body` | string | DOM target to create the chat
| options.name | `null` | string | The bot name. If filled, a label will appear in message bubble
| options.timestampable | `false` | boolean | Show current time of messages
| options.timestampFormatter | `HH:mm:ss` | function `(ts) => string` | Change format of timestamp displayed in messages. You can also use moment.js lib, by `ts => moment(ts).fromNow();`
| options.inputPlaceholder | `Type your message` | string | Message of input placeholder
| options.inputPlaceholderSingleChoice | `Choose an option above` | string | Message of input placeholder when current rule is a SingleChoice type
| options.inputPlaceholderMultipleChoice | `Choose the options above` | string | Message of input placeholder when current rule is a MultipleChoice type
| options.doneMultipleChoiceLabel | `Done` | string | Button label of MultipleChoice type
| options.andSeparatorText | `and` | string | Used to join the user's answer in MultipleChoice type
| options.submitLabel | `Send` | string | Button label of submit message
| options.autoFocus | `true` | boolean | Autofocus the message input whenever possible


## Methods

#### Start

Initialize the chat

```javascript
bot.start();
```

#### Typing

Show the typing component

```javascript
bot.typing();
```

#### Typed

Hide the typing component

```javascript
bot.typed();
```

#### newMessage

New message in chat

```javascript
var message = 'Hello!';
var rule = {
  delay: 1500,
};
bot.newMessage('BOT', message, rule);
```

| Argument | Type | Description |
|----------|------|-------------|
| source | string | `BOT` or `USER`
| message | string, array[string] | A bot message or user's answer
| rule | Rule | Rule configuration


## Binding events

Listen to events

#### Start

Event triggered on started conversation

```javascript
bot.on('start', () => {
  console.log('Started!');
  ga('send', 'event', 'Chat', 'started');
});
```

#### Reply

Event triggered when user replies a message

```javascript
bot.on('reply', (value) => {
  console.log('User has replied:', value);
  ga('send', 'event', 'Chat', 'replied', value);
});
```

#### End

Event triggered when bot terminates the conversation

```javascript
bot.on('end', (output) => {
  fetch('/save', {
    body: JSON.stringify(output),
  });
});
```

[Next: Core API]({{ site.baseurl }}/docs/core){:.btn}
