$(document).ready(function() {
  $.get('/example.yaml').done(function(data) {
    var example = jsyaml.load(data);
    var messages = document.getElementById('messages');
    var loading = document.getElementById('typing');

    var bot = new YveBot(example);
    bot
      .on('talk', function(message) {
        receiveMessage('BOT', message);
      })
      .on('typing', function() {
        loading.classList.add('show');
      })
      .on('typed', function() {
        loading.classList.remove('show');
      })
      .start();

    function receiveMessage(from, message) {
      var li = document.createElement('li');
      li.classList.add(from);
      li.innerHTML = '<p>' + message + '</p>';
      messages.insertBefore(li, loading);
      messages.scrollTop = messages.scrollHeight;
    }

    $('form').on('submit', function(e) {
      e.preventDefault();
      var input = document.getElementById('m');
      if (input.value) {
        receiveMessage('USER', input.value);
        bot.hear(input.value);
        input.value = '';
      } else {
        input.focus();
      }
    })
  });
});
