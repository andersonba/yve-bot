---
title: Getting started
---

# Getting started

The simplest way to build a smart and customized rule-based bot conversation. YveBot was made to run on Browser and Node environment.
Check the available bundles bellow.


### UI - A ready Chat UI
A simple component to be used in your website. (browser-only)

```html
<script src="//cdn.jsdelivr.net/npm/yve-bot/ui.js"></script>
<script>
  new YveBot(rules, { target: '.Chat' }).start();
</script>
```

### Core - Bot engine
Integrate with server-side (eg: websocket, facebook, etc...) or create your own UI. (node/browser)

```bash
npm install yve-bot
```

```javascript
import YveBot from 'yve-bot';
const bot = new YveBot(rules)
bot.start();
```

You will see more details in **Choosing the Bundle** chapter.

[Next: Building rules]({{ site.baseurl }}/docs/building-rules){:.btn}
