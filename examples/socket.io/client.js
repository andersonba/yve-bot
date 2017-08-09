var socket = io.connect('http://localhost:3000');
var messages = document.getElementById('messages');
var loading = document.getElementById('typing');

socket
  .emit('join')
  .on('connected', function (user) {
    window.user = user;
  });

socket.on('receive message', function (data) {
  var li = document.createElement('li');
  li.classList.add(data.from);
  li.innerHTML = '<p>' + data.message + '</p>';
  messages.insertBefore(li, loading);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('is typing', function() {
  loading.classList.add('show');
});

socket.on('is typed', function() {
  loading.classList.remove('show');
});

function sendMessage() {
  var input = document.getElementById('m');
  if (input.value) {
    socket.emit('send message', {
      message: input.value,
      user: window.user,
    });
    input.value = '';
  } else {
    input.focus();
  }
}
