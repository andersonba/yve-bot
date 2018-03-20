---
id: playground
title: Playground
---

Edit the rules in left box and click on Play button to reload the chat.

<div class="Playground">
  <div class="Playground-editor">
<textarea id="editor">
- Hello there!
- Welcome to my playground! 😍
- You can change the conversation in the box at left.
- message: Ah, you need to click on "Play" to restart this chat ✌️
  sleep: 1000
  actions:
    - highlightPlay: true
- message: Remember to star me on GitHub ❤️
  sleep: 2500</textarea>
  <a class="Playground-play" href="javascript:playChat();" title="Play chat">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QsHBQ0YW8JP3wAACS1JREFUaN7NmmtwVdUVgL9zzr7v3CRcAoE8wBBDhFhBeVUCiTCAo6jTwdZRK2Nr0VqLLR2VotZOp4C11c7UIqNItCoVqjwU1FoJigZlVCJCBQwJAZJAQgh53ve959EfJ0CUxN6b3GtcM/mRk7PXXt9aa++9ztqR6Keo/lqovB/Sx0PzB+CtgYZmuHGLhZpn3WiBdHzH7Qin0xwQCJByUQjF2UHBXV42L4iSmwnuAsgshY5DMPkJhCu/X/ZIcQMcfBRq1oJnErR8BAsaZcpLsgidnogWnIIWvBQ9kouhD8WI2gFL99AokiWEJLciWxtQHAdQHHuwD9/H3IpGtmTpDCuGts+g4E5E0UPJAVEbt8H+5eDKhVPvQc4NqbR9NpNI+wJUXwlaZBSGZgUj9qklJYJirUekVGAdsgXPpF2c2NbFiNngb4AJjyCybkgciLrnl+DMhiNlkDnbTfN784l03okWnI4esccb1V5FtoZQHLuxpq0lc/ZbNL/n5eJFEDiJmLJ6YCDq7kXQ9V+wemDW2/DO1FL8dUuJds1BV60JAbgASESwpO7ANfovXP3pB+y8BiJtkHoZYnpZ38P6hDi1A3aWgR4F+zA3W/MepLNqE+G2a5MGAaCrVsJt19JZtYmteQ9iH+ZGj8DOMtOmeEDUgythyRwoSAPb0FE0la8h2LQCLZCRNICvixbIINi0gqbyNdgyRlGQBkvmmLb1Iheklrp7EVSUwfhCsA+/BG/NGsKtJbEv4kSLBDZPBe6CnxNqruJQDZQsuiDNvgKitlXCrptBsYNjxFjaP/8Hka7pgwfRw0xL6m6GTPgpoVPVaEGYuRHhmdwHyH+mgaGBffgIWitfJNI+b/AhephqTd/O0Em3Ezp9CmTENZXn/npujaifPwSOLBgx207HF8uJdnyHIAAMiHbOo+PAcjKvsuPIQv18WU/MbhA1CH9zwNiCOwk0PBX3zmToIMlxDemXSCKCM2cxNUfW8ms/wuI6D6Lu+hF4q0GkjqfjizdQfWPi8pRwgXssdB4ELZx8IOE6Svql1xPtOkTKGETpVmT19A6weWDGegVf7WJUfxwQJgfCDVc8Bpc/BqkFZnSSmZZqYAy+o4u58jkF21DU0ztQfn9TCrTshsa3pxNoWIkRdcRdS1pckH87jJxjVrLo4DsKWjB50TH0fFr37MJ3rIGIFxlnDly7X8Jffxta2NOPgrhbsWHueO58mLgSpq2B4TMBqTtCCRYt7CHQcBvzD0g4sxGceBMa374Y1TcfdPoNct5TICkwci54LofjG+DI8+Cv647OAPWfnwhU/3y2F1+ModXInPkYfHWlaKGcxE2CGR2rBwoXQ/FLMPpmUBzm80SJFsrBX1dK6x5kSrda0MPzMPQEUvTwmqFD+vdg8l9hyirzg+zs8wGr1yX0yDxmvGKROfxkNlpoQlJ3GUMD2Qa5P4DiF2HcfWDP7I7OAOfVwhOofipbJtxSiB7NSmha9U5jGu4YCUVLYfoLkH0dyNaBRceIZhFuLZSJegsxNGeSKXpM3G10xlSYuhqueBzSxvX/7DE0J6qvUEYL52Ho30JtcYEBZkWQ92MoXgdj7wZLevybgWHI6OE8GSOaOXjFYXe6pVwEl/0BriyDzFnmNh1zuhmgq5kCSUkbJIoetnQXnJlXwZDL4PhGqC0DXx0xOVlS0mSM71CpbmhgHQKFv4AJy8GeERsIBgJJVgfb/nMiKaD64MQbUL0Gwq3EtptKqkBXm82XBzEyZ9dEayUcXg1N27sLTiWWwWCozQLhaCTaweCkmGRCBJvg6EvmT7DJfBYTBCBJoDgaBYqjGuQI6MnrVfVqgAJaCJrK4fBT0Lb3fMEZl8gRFHu1wJpehSza0dTMb4nA9GLHQah+Gk5sM9eFpPTv20VW2rGkVglSCmrpqjmCFko+iKSYC7juFagpA//x+NKoVxDrEVLyawWvr+vk+yMrQCpO2oKXZNBVaH7fTKOW3ebvAwEwFYNsreDfr3YKZowB2badaOev0COuBBOYEN5aOLIW6jZCpL3/afR1kYUfS+p2ptoReCaBcO4l3FJJJFKaOAYFol3Q8DpUPwNdh821MeAo9BDFUYlnyl60AIJ1G6GELlILXibqK8FQB1bPnz0TznwMVavMSyE9kvgmhCQMrENepm59F+UgWPoc1L8KwrWV8JmfEfVO65/ibm/766H2BTj2TwidTlwafV0U+6ekX7qVlDx4+KbuBt3GDNCD4Mi5lUD98+hRW8wKDQMcI2DmBnMtVK2Cjv3mviEl6WNNFmEcuXcQPLkeqxuxoBkBmD0pfz04R73G8fXzCZ+5NeYdTAJUP+x7xDzUzp0JyWEwO/Npm8ma9xqBk2AfCTzdo/f77lwInABL6iV0Hd6C6hsXl35DS3C7pw8Rri9xFywg2lWFIwsx932g543VuAfgukNw8pMqXKOWodha43OUknwI2daKM2cZjZVVXH8Yelxhf/V+5MsnzGvh656EZ8feTeDEE+hhV/IbE7FAWP04s+/nNzXPsOEecI1GFP22dxAAtWKBuX1e8bjMu3PvJdSy0oQZZAj7sIeZ9dYq9i7TkWTEVdu+8kqvrlYrbjRTpXidwlsT7iDQsAItPHxwIGyncWb/jvn7nuejhRp69AII6ONWV5RsNu8RP7lLY1PVWlyjFyJS9n27KSaBcO3DlbuQLdVr+eQuDeHoFaL77b5F/fRus3974FEYdmUe/vqHiLTdgh5NbqrJFj9WzwacuY9y5uNjFC2FSAdi2rN9D/kmfWLqM2YD4I9ApP0Y4++7h5S8W7C4y5GUcMIBJCWMcJfjGn0Llyy5h2j7MVYA9uHfCAGx/i9K/SaoXm2e4A3bwDM5heDJq4l2LkQNzMCIDu1321OSQbK0IpwfYkldhyPrHdo+85Fzg/nZW3gvYtQP/68aEctcZxWpB/4ExzaAHvIRqN9M4ZI3adpeRPjMLLRACXq0CEPNxNAcGIZyYXUggSRpSEoQSTQjWw6iOCqwZexkxNyDVP89jNUDahDSihAz/gV8EJs/+uNEtX6TWZJ4JkL7Pmj5EiY+YKPlw2wiHQWo3nwM4yJUrxtJuAHQVS8WtxdJOo5IqcU6pIZhJSfZ/+cwGeMgfaJZo41fisj/Sdw2/Q8GH5pOdtUKdwAAACh0RVh0Q29tbWVudABSZXNpemVkIHdpdGggZXpnaWYuY29tIEdJRiBtYWtlco8UFNsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMTEtMDdUMDQ6MTM6MjQrMDE6MDC0Cmi6AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTExLTA3VDA0OjEzOjI0KzAxOjAwxVfQBgAAABJ0RVh0U29mdHdhcmUAZXpnaWYuY29toMOzWAAAAABJRU5ErkJggg==" alt="play" />
  </a>
  </div>
  <div class="Playground-preview">
    <div class="Playground-chat"></div>
  </div>
</div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/lib/codemirror.css">
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/lib/codemirror.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5.31.0/mode/yaml/yaml.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.9.1/js-yaml.min.js"></script>
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
  function playChat() {
    document.querySelector('.Playground-chat').innerHTML = '';
    var rules = editor.getValue();
    new YveBot(jsyaml.load(rules), { target: '.Playground-chat' }).start();
  }
  playChat();
</script>
