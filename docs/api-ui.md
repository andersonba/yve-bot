---
id: api-ui
title: UI Bundle API
---

```javascript
new YveBotUI(rules, options);
```

| Argument | Default | Type | Description |
|----------|---------|------|-------------|
| rules | - | array[Rule] | Array of Rule
| options.target | `body` | string | DOM target to create the chat
| options.name | `null` | string | The bot name. If filled, a label will appear in message bubble
| options.timestampable | `false` | boolean | Show current time of messages
| options.timestampFormatter | `HH:mm:ss` | function `(ts) => string` | Change format of timestamp displayed in messages.<br/>You can also use moment.js: `ts => moment(ts).fromNow()`
| options.inputPlaceholder | `Type your message` | string | Message of input placeholder
| options.inputPlaceholderSingleChoice | `Choose an option above` | string | Message of input placeholder when current rule is a SingleChoice type
| options.inputPlaceholderMultipleChoice | `Choose the options above` | string | Message of input placeholder when current rule is a MultipleChoice type
| options.doneMultipleChoiceLabel | `Done` | string | Button label of MultipleChoice type
| options.moreOptionsLabel | `More options` | string | Button label used in options paginator to show more items
| options.andSeparatorText | `and` | string | Used to join the user's answer in MultipleChoice type
| options.submitLabel | `Send` | string | Button label of submit message
| options.autoFocus | `true` | boolean | Autofocus the message input whenever possible
| options.yveBotOptions | `{}` | object | YveBot Core options
