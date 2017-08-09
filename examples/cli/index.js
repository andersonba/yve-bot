import fs from 'fs';
import yaml from 'js-yaml';
import prompt from 'prompt';
import YveBot from '../../src/core';

prompt.start();
const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../example.eyaml', 'utf8'));
const bot = new YveBot(example);

bot
  .on('talk', message => {
    console.log(message);
  })
  .on('hear', reply => {
    prompt.get('user', (err, res) => {
      if (err) { throw err; }
      reply(res.user);
    });
  })
  .start();
