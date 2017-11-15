---
title: Extensions
---

# Extensions

Enhance your chat with custom extensions and load just what you're going to use.

### Types

##### [StringSearch]({{ site.baseurl }}/docs/rule-type-string-search)

Autocomplete-like for chat conversation.


### How to import?

##### Node
```javascript
import YveBot from 'yve-bot';
import 'yve-bot/ext/types/TypeName';
```

##### React with UI bundle
```javascript
import YveBot from 'yve-bot/ui';
require('yve-bot/ext/types/TypeName')(YveBot);
```

##### Browser with UI bundle
```html
<script src="//cdn.jsdelivr.net/npm/yve-bot@latest/ui.js"></script>
<script src="//cdn.jsdelivr.net/npm/yve-bot@latest/ext/types/TypeName"></script>
```



[Next: Examples]({{ site.baseurl }}/docs/examples){:.btn}
