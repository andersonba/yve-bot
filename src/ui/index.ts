import YveBot from '../core';
import { Answer, ChatMessageSource, IChatOptions, IRule } from '../types';
import { ChatUI } from './ui';

export default class YveBotUI extends YveBot {
  public UIOptions: IChatOptions;
  public UI: ChatUI;

  constructor(rules: IRule[], opts?: IChatOptions) {
    const DEFAULT_OPTS: IChatOptions = {
      andSeparatorText: 'and',
      autoFocus: true,
      doneMultipleChoiceLabel: 'Done',
      inputPlaceholder: 'Type your message',
      inputPlaceholderMultipleChoice: 'Choose the options above',
      inputPlaceholderSingleChoice: 'Choose an option above',
      moreOptionsLabel: 'More options',
      submitLabel: 'Send',
      target: 'body',
      timestampFormatter: (ts) => new Date(ts).toUTCString().slice(-12, -4),
      timestampable: false,
    };
    const UIOptions = { ...DEFAULT_OPTS, ...opts };
    super(rules, UIOptions.yveBotOptions);

    this.UIOptions = UIOptions;
    this.UI = new ChatUI(this.UIOptions);

    this
      .on('start', () => {
        document
          .querySelector(this.UIOptions.target)
          .appendChild(this.UI.chat);

        if (this.UIOptions.autoFocus) {
          this.UI.input.focus();
        }
      })
      .on('talk', (msg: string, rule: IRule) => {
        this.newMessage('BOT', msg, rule);
      })
      .on('typing', () => this.typing())
      .on('typed', () => this.typed());

    this.UI.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const msg = this.UI.input.value.trim();

      if (msg) {
        this.hear(msg);
        this.newMessage('USER', msg);
        this.UI.input.value = '';
        this.UI.input.dispatchEvent(new Event('input'));
      }
      if (this.UIOptions.autoFocus) {
        this.UI.input.focus();
      }
    });
  }

  public typing() {
    this.UI.scrollDown(this.UI.typing.offsetHeight, () =>
      this.UI.typing.classList.add('is-typing'));
    return this;
  }

  public typed() {
    this.UI.scrollDown(this.UI.typing.offsetHeight, () =>
      this.UI.typing.classList.remove('is-typing'));
    return this;
  }

  public newMessage(source: ChatMessageSource, message: Answer | Answer[], rule?: IRule) {
    const { UI } = this;
    const sender = source === 'BOT' ? this.UIOptions.name : null;
    const thread = UI.createThread(source, UI.createTextMessage(message, sender));

    if (source === 'BOT') {
      this.UI.setInputType(rule.multiline ? 'textarea' : 'inputText');

      switch (rule.type) {
        case 'SingleChoice':
        thread.appendChild(UI.createSingleChoiceMessage(rule, (label, value) => {
          this.hear(value);
          this.newMessage('USER', label);
        }));
        break;

        case 'MultipleChoice':
        thread.appendChild(UI.createMultipleChoiceMessage(rule, (label, value) => {
          this.hear(value);
          this.newMessage('USER', label);
        }));
        break;
      }
    }
    UI.appendThread(source, this.UI.conversation, thread);
    return this;
  }
}
