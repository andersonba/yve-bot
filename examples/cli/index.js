const fs = require('fs');
const yaml = require('js-yaml');
const prompt = require('prompt');
const YveBot = require('../../lib/yve.core');

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
  .on('hear', () => {
    prompt.get('user', (err, res) => {
      if (err) { throw err; }
      bot.hear(res.user);
    });
  })
  .on('end', data => {
    console.log('> Finished with data:', data);
  })
  .start();
