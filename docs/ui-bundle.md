---
id: ui-bundle
title: UI Bundle
---

Create chatbots without reimplement the chat components. You can also customize it.

### Using in browser
Use directly on your website.

```html
<script src="//cdn.jsdelivr.net/npm/yve-bot/web.js"></script>
<script>
  new YveBot(rules, { target: '.Chat' }).start();
</script>
```

### Using with bundlers

If you are using Webpack (eg.: in React app)

Install using `yarn`:
```
yarn install yve-bot
```

```javascript
import YveBotUI from 'yve-bot/ui';
```

See the options in [API Reference](api-ui.md).
