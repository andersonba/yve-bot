import fs from 'fs';
import yaml from 'js-yaml';
import prompt from 'prompt';
import YveBot from '../../src/core';

prompt.start();
const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../example.eyaml', 'utf8'));
const bot = new YveBot(example, {
  username: 'andersonba',
});

bot
  .on('talk', (message, data) => {
    console.log(message);

    if (data.type === 'SingleChoice') {
      const options = data.options.map(o => o.value || o.label);
      console.log(`Escolha uma das opções: [${options.join(', ')}]`);
    }
  })
  .on('hear', reply => {
    prompt.get('user', (err, res) => {
      if (err) { throw err; }
      reply(res.user);
    });
  })
  .on('end', data => {
    console.log('> Finished with data:', data);
  })
  .start();
