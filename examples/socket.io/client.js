var socket = io.connect('http://localhost:3000');
var input = document.getElementById('m');
var messages = document.getElementById('messages');
var output = document.getElementById('output');
var loading = document.getElementById('typing');

socket
  .emit('join')
  .on('connected', function (user) {
    window.user = user;
  });

socket.on('store changed', function(store) {
  output.innerText= JSON.stringify(store, null, 2);
});

socket.on('error', function(err) {
  alert('Error! Check the console output');
  console.error(err);
});

socket.on('receive message', function (payload) {
  var li = document.createElement('li');
  li.classList.add(payload.from);
  li.innerHTML = '<p>' + payload.message + '</p>';

  var data = payload.data;
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
  scrollUp();
});

socket.on('is typing', function() {
  loading.classList.add('show');
  scrollUp();
});

socket.on('is typed', function() {
  loading.classList.remove('show');
  scrollUp();
});

function scrollUp() {
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage(value) {
  socket.emit('send message', {
    message: value,
    user: window.user,
  });
}

function submit() {
  if (input.value) {
    sendMessage(input.value);
    input.value = '';
  } else {
    input.focus();
  }
}
