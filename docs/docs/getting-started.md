---
title: Getting started
---

# Getting started

The simplest way to build a smart and customized rule-based bot conversation. YveBot was made to run on Browser and Node environment.

To use on **Browser**:

```html
<script src="//cdn.jsdelivr.net/npm/yve-bot/ui.js"></script>
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

[Next: Building rules]({{ site.baseurl }}/docs/building-rules){:.btn}
