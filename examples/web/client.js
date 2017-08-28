$(document).ready(function() {
  $.get('/example.yaml').done(function(data) {
    var example = jsyaml.load(data);
    var bot = new YveBot(example);

    Chat.sendMessage = function(message, label) {
      Chat.receiveMessage('USER', label || message);
      bot.hear(message);
    };

    bot
      .on('talk', function(message, data) {
        Chat.receiveMessage('BOT', message, data);
      })
      .on('typing', function() {
        Chat.typing();
      })
      .on('typed', function() {
        Chat.notTyping();
      })
      .on('storeChanged', function(data) {
        Chat.changeOutput(data.output);
      })
      .start();
  });
});
