---
title: Documentation
---

### Index

1. [Getting started](/docs/#getting-started)
1. [Building rules](/docs/#building-rules)
1. [Rule specification](/docs/rule)
1. [Choosing the Bundle](/docs/#choosing-the-bundle)
1. [Core API](/docs/core)
1. [Creating custom types](/docs/core/#custom-types)
1. [Creating custom actions](/docs/core/#custom-actions)
1. [Creating custom validators](/docs/core/#custom-validators)
1. [Web API](/docs/web)
1. [Play demo](/docs/#play-demo)
1. [Integration examples](/docs/#integrations)


# Getting started

The simplest way to build a smart and customized rule-based conversation. YveBot was made to run on Browser and Node environments.

To use on **Browser**:

```html
<script src="directory/to/yve-bot.web.js"></script>
```

```javascript
new YveBot(rules, { target: '.Chat' }).start();
```

To use on **Node**:

```bash
npm install yve-bot
```

```javascript
import YveBot from 'yve-bot';

const bot = new YveBot(rules);
bot.start();
```

# Building rules

Define the conversation with an array of [Rules](/docs/rule). For better readability, It's recommended that you use `yaml` to write the rules (you will need to compile it to `javascript Object`).

```javascript
// javascript object
const rules = [
  'Hello!'
];
new YveBot(rules);

// yaml file
import yaml from 'js-yaml';
const file = fs.readFileSync('./chat.yaml', 'utf8');
const rules = yaml.safeLoad(file);
new YveBot(rules);
```

See the [Rule specification](/docs/rule)

# Choosing the Bundle

YveBot have two bundles. Make your choice:

| Bundle | Description | Browser | Node |
|--------|-------------|---------|------|
| [Core](/docs/core) | Minimal code to configure and run the bot. You will need to implement each bot hook. | X | X
| [Web](/docs/web) | A pre-defined wrapper over the *Core* that implements a basic chat conversation ([like that](/)). You will only have to create a style file. | X

# Play demo

[Check out](https://codepen.io/) in Codepen

# Integration examples

- [Web](https://github.com/andersonba/yve-bot/tree/master/examples/web)
- [Socket.io](https://github.com/andersonba/yve-bot/tree/master/examples/socket.io)
- [Command Line](https://github.com/andersonba/yve-bot/tree/master/examples/cli)
- [Facebook Chat](https://github.com/andersonba/yve-bot/tree/master/examples/facebook)
