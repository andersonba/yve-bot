var socket = io.connect('http://localhost:3000');

socket
  .emit('join')
  .on('connected', function (user) {
    window.user = user;
    window.store = {};
  });

socket
  .on('store changed', function(store) {
    window.store = store;
    Chat.changeOutput(store.output);
  })
  .on('error', function(err) {
    alert('Error! Check the console output');
    console.error(err);
  })
  .on('receive message', function (payload) {
    Chat.receiveMessage(payload.from, payload.message, payload.data);
  })
  .on('is typing', function() {
    Chat.typing();
  })
  .on('is typed', function() {
    Chat.notTyping();
  });

Chat.sendMessage = function (message) {
  socket.emit('send message', {
    message: message,
    store: window.store,
    sid: window.user,
  });
};
