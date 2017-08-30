var socket = io.connect('http://localhost:3000');

var chat = new YveBot([], {
  target: '.Chat',
})
  .on('reply', function(value) {
    socket.emit('reply', {
      message: value,
      store: window.store,
      sid: window.user,
    });
  })
  .start();

socket
  .emit('join')
  .on('connected', function (user) {
    window.user = user;
    window.store = {};
  });

socket
  .on('storeChanged', function(store) {
    window.store = store;
    document.getElementById('output').innerText = JSON.stringify(store, null, 2);
  })
  .on('error', function(err) {
    alert('Error! Check the console output');
    console.error(err);
  })
  .on('talk', function (payload) {
    chat.newMessage('BOT', payload.message, payload.data);
  })
  .on('typing', function() {
    chat.typing();
  })
  .on('typed', function() {
    chat.typed();
  });
