const fs = require('fs');
const yaml = require('js-yaml');
const prompt = require('prompt');
const YveBot = require('../../lib/core');

const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../chat.yaml', 'utf8'));
const bot = new YveBot(example);

prompt.message = '';
prompt.start();

bot
  .on('talk', (message, data) => {
    console.log(message);

    if (data.options && data.options.length) {
      const options = data.options.map(o => o.value || o.label);
      console.log(`Choose an option: [${options.join(', ')}]`);
    }
  })
  .on('hear', () => {
    prompt.get('You', (err, res) => {
      if (err) { throw err; }
      bot.hear(res.You);
    });
  })
  .on('end', data => {
    console.log('> Finished with data:', data);
  })
  .start();
