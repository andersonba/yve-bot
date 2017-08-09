$(document).ready(function() {
  $.get('/example.yaml').done(function(data) {
    var example = jsyaml.load(data);
    var input = document.getElementById('m');
    var messages = document.getElementById('messages');
    var loading = document.getElementById('typing');

    var bot = new YveBot(example);
    bot
      .on('talk', function(message, data) {
        receiveMessage('BOT', message, data);
      })
      .on('typing', function() {
        loading.classList.add('show');
      })
      .on('typed', function() {
        loading.classList.remove('show');
      })
      .start();

    function receiveMessage(from, message, data) {
      var li = document.createElement('li');
      li.classList.add(from);
      li.innerHTML = '<p>' + message + '</p>';

      if (data && data.type === 'SingleChoice') {
        var options = document.createElement('div');
        for (var i=0, len=data.options.length; i < len; i++) {
          var opt = data.options[i];
          var btn = document.createElement('button');
          btn.onclick = function() {
            sendMessage(this.dataset.value);
            options.remove();
            input.focus();
          };
          btn.dataset.value = opt.value || opt.label;
          btn.innerText = opt.label;
          options.appendChild(btn);
        }
        li.appendChild(options);
      }

      messages.insertBefore(li, loading);
      messages.scrollTop = messages.scrollHeight;
    }

    function sendMessage(value) {
      receiveMessage('USER', value);
      bot.hear(value);
    }

    $('form').on('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        sendMessage(input.value);
        input.value = '';
      } else {
        input.focus();
      }
    })
  });
});
