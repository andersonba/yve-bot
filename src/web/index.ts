import { YveBot } from '../core/bot';
import { Rule } from '../types';

type MessageSource = 'BOT' | 'USER';

interface ChatOptions {
  target: string;
  inputPlaceholder: string;
  inputPlaceholderSingleChoice: string;
  inputPlaceholderMutipleChoice: string;
  doneMultipleChoiceLabel: string;
  andSeparatorText: string;
  submitLabel: string;
  avatars: {
    bot: string;
    user: string;
  },
  onFinish?: (data: Object) => {},
  typing?: HTMLParagraphElement,
}

function createTyping() {
  const el = document.createElement('p');
  el.className = 'yvebot-typing';
  [1, 2, 3].forEach(() => {
    const dot = document.createElement('span');
    dot.className = 'yvebot-typing-dot';
    el.appendChild(dot);
  });
  return el;
}

function createConversation() {
  const el = document.createElement('ul');
  el.className = 'yvebot-conversation';
  return el;
}

function createThread(source: MessageSource, child: HTMLElement, customClass?: string) {
  const el = document.createElement('li');
  el.className = `yvebot-thread yvebot-thread-${source.toLowerCase()}`;
  if (customClass) {
    el.className += ` ${customClass}`;
  }
  el.appendChild(child);
  return el;
}

function createMessage(source: MessageSource, message: string) {
  const el = document.createElement('p');
  el.className = 'yvebot-message';
  el.innerText = message;
  return createThread(source, el);
}

function createMultipleChoice(
  source: MessageSource,
  msg: string,
  rule: Rule,
  form: HTMLFormElement,
  onClick: (bubbles: NodeListOf<Element>) => void,
  options: ChatOptions,
) {
  const $message = createMessage(source, msg);
  if (rule.options.length) {
    const $submit = form.querySelector('.yvebot-form-submit');
    const $input = form.querySelector('.yvebot-form-input');
    const $options = document.createElement('div');
    $options.className = 'yvebot-message-bubbles';

    const $done = document.createElement('button');
    $done.innerText = options.doneMultipleChoiceLabel;
    $done.className = 'yvebot-message-bubbleDone';
    $done.style.display = 'none';
    $done.onclick = function() {
      const $bubbles = $options.querySelectorAll('.yvebot-message-bubbleBtn.selected');
      onClick($bubbles);
      $options.remove();
      $done.remove();
    }

    rule.options.forEach(opt => {
      const $btn = document.createElement('button');
      $btn.className = 'yvebot-message-bubbleBtn';
      $btn.onclick = () => {
        $btn.classList.toggle('selected');
        if ($options.querySelectorAll('.yvebot-message-bubbleBtn.selected').length) {
          $done.style.display = 'inline-block';
        } else {
          $done.style.display = 'none';
        }
      };
      $btn.dataset.label = opt.label;
      $btn.dataset.value = opt.value ? String(opt.value) : '';
      $btn.innerText = opt.label;
      $options.appendChild($btn);
    });
    if ($input instanceof HTMLInputElement) {
      $input.disabled = true;
      $input.placeholder = options.inputPlaceholderMutipleChoice;
    }
    if ($submit instanceof HTMLButtonElement) {
      $submit.disabled = true;
    }

    $message.appendChild($options);
    $message.appendChild($done);
  }
  return $message;
}

function createSingleChoice(
  source: MessageSource,
  msg: string,
  rule: Rule,
  form: HTMLFormElement,
  onClick: (bubble: HTMLElement) => void,
  options: ChatOptions,
) {
  const $message = createMessage(source, msg);
  if (rule.options.length) {
    const $submit = form.querySelector('.yvebot-form-submit');
    const $input = form.querySelector('.yvebot-form-input');
    const $options = document.createElement('div');
    $options.className = 'yvebot-message-bubbles';

    rule.options.forEach(opt => {
      const $btn = document.createElement('button');
      $btn.className = 'yvebot-message-bubbleBtn';
      $btn.onclick = function() {
        onClick(this);
        $options.remove();
        if ($input instanceof HTMLInputElement) {
          $input.disabled = false;
          $input.placeholder = options.inputPlaceholder;
          $input.focus();
        }
        if ($submit instanceof HTMLButtonElement) {
          $submit.disabled = false;
        }
      };
      $btn.dataset.label = opt.label;
      $btn.dataset.value = opt.value ? String(opt.value) : '';
      $btn.innerText = opt.label;
      $options.appendChild($btn);
    });
    if ($input instanceof HTMLInputElement) {
      $input.disabled = true;
      $input.placeholder = options.inputPlaceholderSingleChoice;
    }
    if ($submit instanceof HTMLButtonElement) {
      $submit.disabled = true;
    }
    $message.appendChild($options);
  }
  return $message;
}

function createForm(options: ChatOptions) {
  const el = document.createElement('form');
  el.className = 'yvebot-form';
  const input = document.createElement('input');
  input.className = 'yvebot-form-input';
  input.type = 'text';
  input.placeholder = options.inputPlaceholder;
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.className = 'yvebot-form-submit';
  submit.type = 'submit';
  submit.innerText = options.submitLabel;
  el.appendChild(input);
  el.appendChild(submit);
  return el;
}

function createChat() {
  const el = document.createElement('div');
  el.className = 'yvebot-chat';
  return el;
}

function appendThreadMessage(
  conversation: HTMLUListElement,
  refThread: HTMLLIElement,
  thread: HTMLLIElement,
) {
  conversation.insertBefore(thread, refThread);
  conversation.scrollTop = conversation.scrollHeight;
}

function nodeListToArray(nodeList: NodeListOf<Element>): HTMLButtonElement[] {
  return [].slice.call(nodeList);
}

function arrayToString(texts: string[], separator: string): string {
  const part1 = texts.slice(0, -1).join(', ');
  const part2 = texts.slice(-1);
  if (texts.length === 1) {
    return texts[0];
  }
  return  `${part1} ${separator} ${part2}`;
}


function YveBotChat(rules: Rule[], opts: ChatOptions): YveBot {
  const DEFAULT_OPTS = {
    inputPlaceholder: 'Type your message',
    inputPlaceholderSingleChoice: 'Choose an option above',
    inputPlaceholderMutipleChoice: 'Choose the options above',
    doneMultipleChoiceLabel: 'Done',
    andSeparatorText: 'and',
    submitLabel: 'Send',
    avatars: {
      bot: 'assets/images/avatar-bot.png',
      user: 'assets/images/avatar-user.png'
    },
  };

  const options = Object.assign({}, DEFAULT_OPTS, opts);
  const bot = new YveBot(rules);

  // create elements
  const $form = createForm(options);
  const $conversation = createConversation();
  const $typing = createThread('BOT',
    options.typing || createTyping(),
    'yvebot-thread-typing',
  );
  const $chat = createChat();

  $conversation.appendChild($typing);
  $chat.appendChild($conversation);
  $chat.appendChild($form);
  $form.addEventListener('submit', ev => {
    ev.preventDefault();
    const $input = $form.querySelector('.yvebot-form-input');

    if ($input instanceof HTMLInputElement) {
      const msg = $input.value.trim();
      if (msg) {
        bot.hear(msg);
        appendThreadMessage($conversation, $typing, createMessage('USER', msg));
        $input.value = '';
      } else {
        $input.focus();
      }
    }
  });

  return bot
    .on('start', function() {
      document
        .querySelector(options.target)
        .appendChild($chat);

      bot.dispatch('render');
    })
    .on('talk', function(msg: string, rule: Rule) {
      let $message;
      switch(rule.type) {
        case 'SingleChoice':
        const onClickSingleChoice = (bubble) => {
          bot.hear(bubble.dataset.value || bubble.dataset.label);
          appendThreadMessage($conversation, $typing, createMessage('USER', bubble.dataset.label));
        };
        $message = createSingleChoice('BOT', msg, rule, $form, onClickSingleChoice, options);
        break;

        case 'MultipleChoice':
        const onClickMultipleChoice = (bubbles) => {
          const label = arrayToString(nodeListToArray(bubbles).map(b => b.dataset.label), options.andSeparatorText);
          const value = nodeListToArray(bubbles)
            .map(b => b.dataset.value || b.dataset.label);
          bot.hear(value);
          appendThreadMessage($conversation, $typing, createMessage('USER', label));
        };
        $message = createMultipleChoice('BOT', msg, rule, $form, onClickMultipleChoice, options);
        break;

        default:
        $message = createMessage('BOT', msg);
      }
      appendThreadMessage($conversation, $typing, $message);
    })
    .on('typing', function() {
      $typing.classList.add('is-typing');
    })
    .on('typed', function() {
      $typing.classList.remove('is-typing');
    })
    .on('end', options.onFinish || function() {});
}

export = YveBotChat;
