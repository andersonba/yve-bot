---
title: Playground
---

# Playground

{% include playground.html %}

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/lib/codemirror.css">
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/lib/codemirror.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/mode/yaml/yaml.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.9.1/js-yaml.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/yve-bot/ui.min.js"></script>

<script>
  var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'yaml',
    tabSize: 2,
  });

  YveBot.actions.define('highlightPlay', function() {
    var icon = document.querySelector('.Playground-play');
    icon.classList.add('highlight');
    setTimeout(function() {
      icon.classList.remove('highlight');
    }, 1000);
  });

  function toggleMode() {
    var modes = document.querySelectorAll('.Playground-mode');
    [].forEach.call(modes, function(div) {
      div.classList.toggle('hide');
    });
  }

  function playChat() {
    document.querySelector('.Chat').innerHTML = '';
    var rules = editor.getValue();
    new YveBot(jsyaml.load(rules), { target: '.Chat' }).start();
  }

  playChat();
</script>
