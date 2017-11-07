---
title: Building Rules
---

# Building rules

A conversation is defined by an array of Rules. For better readability, I used the __yaml__ language to write these rules, but you must to use __javascript__ to create rules or compile using __js-yaml__. See bellow:

```javascript
// plain javascript
const rules = [
  'Hello!',
  { message: 'Enter your e-mail', name: 'email', type: 'String' },
];
new YveBot(rules);

// compile from yaml
import yaml from 'js-yaml';
const file = fs.readFileSync('./chat.yaml', 'utf8');
const rules = yaml.safeLoad(file);
new YveBot(rules);
```

Hint: You can automate compiling the yaml file in your build step, creating a javascript file.

[Next: Rule Specification]({{ site.baseurl }}/docs/rule){:.btn}
