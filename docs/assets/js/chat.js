var rules = [ "Hello! I'm Yve Bot.", { "message": "What's your name?", "name": "name", "type": "String", "replyMessage": "Thanks for the answer, {name}!", "validators": [ { "min": 4 }, { "minWords": 1 } ] }, { "message": "What city do you live in?", "name": "city", "type": "String" }, "Thanks, wait for a moment.", { "sleep": 4000 }, { "message": "Make your choice", "name": "choice", "type": "SingleChoice", "options": [ { "label": "Button 1", "value": 1 }, { "label": "Button 2", "value": 2 } ] }, "Okay! You choose the button {choice}.", { "message": "What you want to do?", "type": "SingleChoice", "options": [ { "label": "Restart", "next": "name" }, { "label": "Quit" } ] }, { "message": "Bye! :(", "exit": true } ];

YveBot(rules, {
  target: '.Chat',
  onFinish: function(output) {
    console.log(output);
  },
})
  .on('render', function() {
    document.querySelector('.Chat-loading').remove();
    document.querySelector('.yvebot-form-input').focus();
  })
  .start();
