---
title: Building Rules
---

# Building rules

A conversation is defined by an array of Rules. For better readability, it's recommended that you use `yaml` to write these rules (but you will need to compile it to `javascript Object`).

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

[Next: Rule Specification]({{ site.baseurl }}/docs/rule){:.btn}
