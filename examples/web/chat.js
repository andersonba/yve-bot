var $messages = document.getElementById('messages');
var $input = document.getElementById('input');
var $typing = document.getElementById('typing');
var $output = document.getElementById('output');
var $submitBtn = document.getElementById('submit');
var $form = document.getElementsByTagName('form')[0];

window.Chat = {
  sendMessage: function() {
    throw new Error('Not implemented yet');
  },

  scrollUp: function() {
    $messages.scrollTop = $messages.scrollHeight;
  },

  typing: function() {
    $typing.classList.add('show');
    Chat.scrollUp();
  },

  notTyping: function() {
    $typing.classList.remove('show');
    Chat.scrollUp();
  },

  changeOutput: function(data) {
    $output.innerText = JSON.stringify(data, null, 2);
  },

  receiveMessage: function(from, message, data) {
    var li = document.createElement('li');
    li.classList.add(from);
    li.innerHTML = '<p>' + message + '</p>';

    if (data && data.options && data.options.length) {
      var options = document.createElement('div');
      options.classList.add('buttons-list');

      for (var i=0, len=data.options.length; i < len; i++) {
        var opt = data.options[i];
        var btn = document.createElement('button');
        btn.onclick = function() {
          Chat.sendMessage(this.dataset.value, this.dataset.label);
          options.remove();
          $submitBtn.disabled = false;
          $input.disabled = false;
          $input.style = '';
          $input.value = '';
          $input.focus();
        };
        btn.dataset.value = opt.value === null ? '' : (opt.value || opt.label);
        btn.dataset.label = opt.label;
        btn.innerText = opt.label;
        options.appendChild(btn);
      }
      li.appendChild(options);
      $input.disabled = true;
      $submitBtn.disabled = true;
      $input.value = '(Escolha uma opção acima)';
      $input.style = 'color:#aaa; font-style:italic;';
    }

    $messages.insertBefore(li, $typing);
    Chat.scrollUp();
  },
};

$form.addEventListener('submit', function(e) {
  e.preventDefault();

  if ($input.value) {
    Chat.sendMessage($input.value);
    $input.value = '';
  } else {
    $input.focus();
  }
});
