$(document).ready(function() {
  $.get('/chat.yaml').done(function(data) {
    var rules = jsyaml.load(data);

    const chat = new YveBot(rules, {
      target: '.Chat',
      name: 'YveBot',
      timestampable: true,
    });

    chat.actions.define('toSkip', (output, rule, bot) => true);

    console.log(chat.actions);

    chat
      .on('storeChanged', function(data) {
        document.getElementById('output').innerText = JSON.stringify(data, null, 4);
      })
      .on('render', function() {
        document.querySelector('.yvebot-form-input').focus();
      })
      .start();
  });
});
