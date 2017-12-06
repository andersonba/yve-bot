---
title: Building Rules
---

# Building rules

A conversation is defined by an array of Rules. By default, the bot is configured to be rule-based, that is, it will go through all the rules in sequence.

For better readability, I used the __yaml__ language to write these rules, but you must use __javascript__ to create rules or compile using __js-yaml__. See bellow:

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

Hint: To avoid js-yaml dependency in your project, you can compile the yaml file in the build step, creating a javascript file to be imported.

### Passive mode

You can configure the bot to react to user input throughout the conversation.

Example: A user sends "help" in anytime during the conversation, then the conversation jumps to a specific rule.

You can find more details in "Passive mode" section.

[Next: Rule Specification]({{ site.baseurl }}/docs/rule){:.btn}
