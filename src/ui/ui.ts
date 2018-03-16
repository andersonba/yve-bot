import { Answer, ChatMessageSource, IChatOptions, IRule, IRuleOption } from '../types';
import * as utils from './utils';

export class ChatUI {
  public chat: HTMLDivElement;
  public form: HTMLFormElement;
  public textArea: HTMLTextAreaElement;
  public inputText: HTMLInputElement;
  public input: HTMLInputElement | HTMLTextAreaElement;
  public submit: HTMLButtonElement;
  public typing: HTMLLIElement;
  public conversation: HTMLUListElement;
  private options: IChatOptions;

  constructor(options: IChatOptions) {
    this.options = options;
    this.chat = this.createChat();
    this.typing = this.createTyping();
    this.conversation = this.createConversation();
    this.textArea = this.createTextarea();
    this.inputText = this.createInput();
    this.input = this.textArea;
    this.submit = this.createSubmit();
    this.form = this.createForm(this.input, this.submit);
    this.conversation.appendChild(this.typing);
    this.chat.appendChild(this.conversation);
    this.chat.appendChild(this.form);

    this.textArea.addEventListener('keydown', this.handleKey.bind(this), false);
    this.textArea.addEventListener('input', this.handleTextAreaInput);
  }

  public createSingleChoiceMessage(
    rule: IRule,
    onSelected: (label: string, value: string) => void,
  ) {
    if (rule.options.length) {
      this.disableForm(this.options.inputPlaceholderSingleChoice);
      return this.createBubbleMessage(rule, (btn, list) => {
        list.remove();
        this.enableForm();
        onSelected(btn.getAttribute('data-label'), btn.getAttribute('data-value'));
      });
    }
    return document.createElement('div');
  }

  public createBubbleButton(
    option: IRuleOption,
    onClick: (btn: HTMLButtonElement) => void,
    opts?: { class?: string },
  ) {
    const btn = document.createElement('button');
    btn.className = 'yvebot-message-bubbleBtn';
    if (opts && opts.class) {
      btn.classList.add(opts.class);
    }
    btn.onclick = () => {
      onClick(btn);
      this.scrollDown(0, true);
    };
    const { value, label } = option;
    btn.setAttribute('data-value', String((value === undefined ? label : value) || ''));
    btn.setAttribute('data-label', String((label === undefined ? value : label) || ''));
    btn.textContent = btn.getAttribute('data-label');
    return btn;
  }

  public disableForm(placeholder: string) {
    this.submit.disabled = true;
    this.input.disabled = true;
    this.input.placeholder = placeholder;
  }

  public enableForm() {
    this.submit.disabled = false;
    this.input.disabled = false;
    this.input.placeholder = this.options.inputPlaceholder;

    if (this.options.autoFocus) {
      this.input.focus();
    }
  }

  public createBubbleMessage(rule: IRule, onClick: (btn: HTMLButtonElement, list: HTMLDivElement) => void) {
    const { maxOptions = 0 } = rule;
    const { moreOptionsLabel: label } = this.options;
    const bubbles = document.createElement('div');
    bubbles.className = `yvebot-message-bubbles yvebot-ruleType-${rule.type}`;

    const createButtonsPaginator = (options: IRuleOption[], start = 0) => {
      const end = !!maxOptions ? start + maxOptions - 1 : options.length;
      options.slice(start, end).forEach((opt, idx) => {
        const bubble = this.createBubbleButton(opt, (btn) => onClick(btn, bubbles));
        bubbles.appendChild(bubble);
        if (end < options.length && idx === maxOptions - 2) {
          const moreBtn = this.createBubbleButton({ label }, () => {
            createButtonsPaginator(options, end);
            moreBtn.remove();
          }, { class: 'yvebot-message-bubbleMoreOptions' });
          bubbles.appendChild(moreBtn);
        }
      });
    };

    createButtonsPaginator(rule.options);
    return bubbles;
  }

  public createMultipleChoiceMessage(
    rule: IRule,
    onDone: (label: string[], value: string[]) => void,
  ) {
    const message = document.createElement('div');

    if (rule.options.length) {
      const done = document.createElement('button');
      done.textContent = this.options.doneMultipleChoiceLabel;
      done.className = 'yvebot-message-bubbleDone';
      done.style.display = 'none';

      const self = this;
      done.onclick = function() {
        const bubbles = this.previousElementSibling;
        const selected = bubbles.querySelectorAll('.yvebot-message-bubbleBtn.selected');
        const label = utils.nodeListToArray(selected).map((b) => b.getAttribute('data-label'));
        const value = utils.nodeListToArray(selected).map((b) => b.getAttribute('data-value'));
        onDone(label, value);
        bubbles.remove();
        done.remove();
        self.enableForm();
      };

      const bubbleMsg = this.createBubbleMessage(rule, (btn) => {
        btn.classList.toggle('selected');
        if (bubbleMsg.querySelectorAll('.yvebot-message-bubbleBtn.selected').length) {
          done.style.display = 'inline-block';
        } else {
          done.style.display = 'none';
        }
      });

      this.disableForm(this.options.inputPlaceholderMutipleChoice);

      message.appendChild(bubbleMsg);
      message.appendChild(done);
    }
    return message;
  }

  public createChat() {
    const chat = document.createElement('div');
    chat.className = 'yvebot-chat';
    return chat;
  }

  public createConversation() {
    const conversation = document.createElement('ul');
    conversation.className = 'yvebot-conversation';
    return conversation;
  }

  public createTyping() {
    const typing = document.createElement('div');
    typing.className = 'yvebot-typing';
    [1, 2, 3].forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'yvebot-typing-dot';
      typing.appendChild(dot);
    });
    return this.createThread('BOT', typing, 'yvebot-thread-typing');
  }

  public createForm(input: HTMLInputElement | HTMLTextAreaElement, submit: HTMLButtonElement) {
    const form = document.createElement('form');
    form.className = 'yvebot-form';
    form.appendChild(input);
    form.appendChild(submit);
    return form;
  }

  public createSubmit() {
    const submit = document.createElement('button');
    submit.className = 'yvebot-form-submit';
    submit.type = 'submit';
    submit.textContent = this.options.submitLabel;
    return submit;
  }

  public createInput() {
    const input = document.createElement('input');
    input.className = 'yvebot-form-input';
    input.type = 'text';
    input.placeholder = this.options.inputPlaceholder;
    input.autocomplete = 'off';
    return input;
  }

  public createTextarea() {
    const textarea = document.createElement('textarea');
    textarea.className = 'yvebot-form-input';
    textarea.rows = 1;
    textarea.placeholder = this.options.inputPlaceholder;
    return textarea;
  }

  public createThread(source: ChatMessageSource, content: HTMLElement, customClass?: string) {
    const thread = document.createElement('li');
    thread.className = `yvebot-thread yvebot-thread-${source.toLowerCase()}`;
    if (customClass) {
      thread.classList.add(customClass);
    }
    thread.appendChild(content);
    return thread;
  }

  public setInputType(inputType: 'inputText' | 'textarea') {
    const element = {
      inputText: this.inputText,
      textarea: this.textArea,
    }[inputType];

    this.form.replaceChild(element, this.input);
    this.input = element;
  }

  public appendThread(source: ChatMessageSource, conversation: HTMLUListElement, thread: HTMLLIElement) {
    conversation.insertBefore(thread, this.typing);
    this.scrollDown(thread.offsetHeight, source === 'USER');
  }

  public scrollDown(offset, force = false) {
    /*
    * Avoid breakdown of reading when user changes the scroll and a new thread is appended
    */
    const marginOfError = 20; // px
    const isBottom = (
      this.conversation.scrollHeight -
      this.conversation.scrollTop -
      this.conversation.offsetHeight -
      marginOfError
    ) <= offset;
    /* istanbul ignore next */
    if (isBottom || force) {
      this.conversation.scrollTop = this.conversation.scrollHeight;
    }
  }

  public createTextMessage(answer: Answer | Answer[], senderName?: string) {
    const { timestampable, timestampFormatter } = this.options;
    let text: string;

    if (answer instanceof Array) {
      const answers = (answer as string[]).map(String);
      text = utils.arrayToString(answers, this.options.andSeparatorText);
    } else {
      text = String(answer);
    }

    const bubble = document.createElement('div');
    bubble.className = 'yvebot-bubble';

    if (senderName) {
      const name = document.createElement('div');
      name.className = 'yvebot-sender';
      name.innerHTML = senderName;
      bubble.appendChild(name);
    }

    const message = document.createElement('div');
    message.className = 'yvebot-message';
    message.innerHTML = text;
    bubble.appendChild(message);

    if (timestampable) {
      const timestamp = document.createElement('div');
      timestamp.className = 'yvebot-timestamp';
      timestamp.innerHTML = timestampFormatter(Date.now());
      bubble.appendChild(timestamp);
    }

    return bubble;
  }

  public handleKey({ keyCode, which, shiftKey }) {
    const code = keyCode ? keyCode : which;

    if (code === 13 && !shiftKey) {
      const event = new Event('submit');
      this.form.dispatchEvent(event);
    }
  }

  public handleTextAreaInput({ target }) {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }
}
