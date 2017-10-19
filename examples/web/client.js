$(document).ready(function() {
  $.get('/chat.yaml').done(function(data) {
    var rules = jsyaml.load(data);

    new YveBot(rules, {
      target: '.Chat',
      name: 'YveBot',
    })
      .on('storeChanged', function(data) {
        document.getElementById('output').innerText = JSON.stringify(data, null, 2);
      })
      .on('render', function() {
        document.querySelector('.yvebot-form-input').focus();
      })
      .start();
  });
});
