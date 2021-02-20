function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {
  var rules = [
    'Hello! I\'m Yve Bot.',
    { message: 'What\'s your name?',
      name: 'name',
      type: 'String',
      replyMessage: 'Thanks for the answer, {name}!',
      validators: [ { min: 4 }, { minWords: 1 } ]
    },
    { message: 'I can ask you using bubble answers. Choose one:',
      name: 'choice',
      type: 'SingleChoice',
      sleep: 1000,
      options: [ { label: 'Button 1', value: 1 }, { label: 'Button 2', value: 2 } ]
    },
    { message: 'Okay! You chose the button {choice}.' },
    { message: 'And about multiple bubbles? Select them:',
      name: 'colors',
      type: 'MultipleChoice',
      options: [ 'Blue', 'Red', 'Black' ]
    },
    'I can do everything for you, just configure me ;)',
    {
      message: 'What do you see now?',
      name: 'choose',
      type: 'SingleChoice',
      sleep: 1500,
      options: [
        { label: 'Docs', next: 'docs' },
        { label: 'Playground', next: 'playground' },
        { label: 'Nothing' }
      ]
    },
    { message: 'Nothing? Why?? :( You will like it!' },
    { sleep: 3000 },
    { message: '...and now?',
      type: 'SingleChoice',
      options: [{ label: 'YES! I really want this now!', next: 'choose' }]
    },
    {
      name: 'playground',
      message: 'Nice! I will redirect you...',
      actions: [{ redirect: './docs/playground' }],
      exit: true,
    },
    {
      name: 'docs',
      message: 'Nice! I will redirect you...',
      actions: [{ redirect: './docs/getting-started' }],
      exit: true,
    }
  ];

  if (document.querySelector('.Chat')) {
    const chat = new YveBot(rules, {
      target: '.Chat',
    });

    chat.actions.define('redirect', (url) => {
      setTimeout(function() {
        window.location.assign(url);
      }, 1000);
    });

    chat
      .on('start', function() {
        document.querySelector('.Chat-loading').remove();
      })
      .on('end', function(output) {
        console.log(output);
      })
      .start();
  }
});
