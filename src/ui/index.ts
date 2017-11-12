import YveBot from '../core';
import { Answer, ChatMessageSource, IChatOptions, IListener, IRule } from '../types';
import { ChatUI } from './ui';

export default class YveBotUI {
  public bot: YveBot;
  public options: IChatOptions;
  public UI: ChatUI;

  private handlers: { [handler: string]: Array<() => any> };

  constructor(rules: IRule[], opts?: IChatOptions) {
    const DEFAULT_OPTS: IChatOptions = {
      andSeparatorText: 'and',
      autoFocus: true,
      doneMultipleChoiceLabel: 'Done',
      inputPlaceholder: 'Type your message',
      inputPlaceholderMutipleChoice: 'Choose the options above',
      inputPlaceholderSingleChoice: 'Choose an option above',
      submitLabel: 'Send',
      target: 'body',
      timestampFormatter: (ts) => new Date(ts).toUTCString().slice(-12, -4),
      timestampable: false,
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
      .on('talk', (msg: string, rule: IRule) => {
        this.newMessage('BOT', msg, rule);
      })
      .on('typing', () => this.typing())
      .on('typed', () => this.typed())
      .on('storeChanged', (...args) => this.dispatch('storeChanged', ...args))
      .on('end', (...args) => this.dispatch('end', ...args));

    this.UI.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
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

  public start() {
    this.bot.start();
    return this;
  }

  public on(evt: string, fn: (...args: any[]) => any): this {
    if (evt in this.handlers) {
      this.handlers[evt].push(fn);
    } else {
      this.handlers[evt] = [fn];
    }
    return this;
  }

  public listen(listeners: IListener[]) {
    return this.bot.listen(listeners);
  }

  public dispatch(name: string, ...args) {
    if (name in this.handlers) {
      this.handlers[name].forEach((fn) => fn(...args));
    }
    return this;
  }

  public typing() {
    this.UI.typing.classList.add('is-typing');
    this.UI.scrollDown();
    return this;
  }

  public typed() {
    this.UI.typing.classList.remove('is-typing');
    this.UI.scrollDown();
    return this;
  }

  public newMessage(source: ChatMessageSource, message: Answer | Answer[], rule?: IRule) {
    const { UI } = this;
    const sender = source === 'BOT' ? this.options.name : null;
    const thread = UI.createThread(source, UI.createTextMessage(message, sender));

    if (source === 'BOT') {
      switch (rule.type) {
        case 'SingleChoice':
        thread.appendChild(UI.createSingleChoiceMessage(rule, (label, value) => {
          this.bot.hear(value);
          this.dispatch('reply', value);
          this.newMessage('USER', label);
        }));
        break;

        case 'MultipleChoice':
        thread.appendChild(UI.createMultipleChoiceMessage(rule, (label, value) => {
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
