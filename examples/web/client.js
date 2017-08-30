$(document).ready(function() {
  $.get('/example.yaml').done(function(data) {
    var rules = jsyaml.load(data);

    YveBot(rules, {
      target: '.Chat',
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
