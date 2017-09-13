import { YveBot } from '../core/bot';
import { Rule, Answer } from '../types';
import { ChatOptions, MessageSource } from './types';
import { ChatUI } from './ui';


export class YveBotChat {
  private handlers: { [handler: string]: Array<() => any> };

  public bot: YveBot;
  public options: ChatOptions;
  public UI: ChatUI;

  constructor(rules: Rule[], opts?: ChatOptions) {
    const DEFAULT_OPTS: ChatOptions = {
      target: 'body',
      inputPlaceholder: 'Type your message',
      inputPlaceholderSingleChoice: 'Choose an option above',
      inputPlaceholderMutipleChoice: 'Choose the options above',
      doneMultipleChoiceLabel: 'Done',
      andSeparatorText: 'and',
      submitLabel: 'Send',
      autoFocus: true,
    };

    this.handlers = {};
    this.options = Object.assign({}, DEFAULT_OPTS, opts);

    this.bot = new YveBot(rules, this.options.yveBotOptions);
    this.UI = new ChatUI(this.options);

    this.bot
      .on('start', (...args) => {
        document
          .querySelector(this.options.target)
          .appendChild(this.UI.chat);

        if (this.options.autoFocus) {
          const $input = this.UI.input;
          $input.focus();
        }

        this.dispatch('start', ...args);
      })
      .on('talk', (msg: string, rule: Rule) => {
        this.newMessage('BOT', msg, rule);
      })
      .on('typing', () => this.typing())
      .on('typed', () => this.typed())
      .on('storeChanged', (...args) => this.dispatch('storeChanged', ...args))
      .on('end', (...args) => this.dispatch('end', ...args));

    this.UI.form.addEventListener('submit', ev => {
      ev.preventDefault();
      const input = this.UI.input;
      const msg = input.value.trim();

      if (msg) {
        this.dispatch('reply', msg);
        this.bot.hear(msg);
        this.newMessage('USER', msg);
        input.value = '';
      }
      if (this.options.autoFocus) {
        input.focus();
      }
    });
  }

  start() {
    this.bot.start();
    return this;
  }

  on(evt: string, fn: (...args: any[]) => any): this {
    if (evt in this.handlers) {
      this.handlers[evt].push(fn);
    } else {
      this.handlers[evt] = [fn];
    }
    return this;
  }

  dispatch(name: string, ...args) {
    if (name in this.handlers) {
      this.handlers[name].forEach(fn => fn(...args));
    }
    return this;
  }

  typing() {
    this.UI.typing.classList.add('is-typing');
    return this;
  }

  typed() {
    this.UI.typing.classList.remove('is-typing');
    return this;
  }

  newMessage(source: MessageSource, message: Answer | Answer[], rule?: Rule) {
    const { UI } = this;
    const thread = UI.createThread(source, UI.createTextMessage(message));

    if (source === 'BOT') {
      switch (rule.type) {
        case 'SingleChoice':
        thread.appendChild(UI.createSingleChoiceMessage(message, rule, (label, value) => {
          this.bot.hear(value);
          this.dispatch('reply', value);
          this.newMessage('USER', label);
        }));
        break;

        case 'MultipleChoice':
        thread.appendChild(UI.createMultipleChoiceMessage(message, rule, (label, value) => {
          this.bot.hear(value);
          this.dispatch('reply', value);
          this.newMessage('USER', label);
        }));
        break;
      }
    }
    UI.appendThread(this.UI.conversation, thread);
    return this;
  }
}
