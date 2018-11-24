import {
  Answer,
  ChatMessageSource,
  IChatOptions,
  IRule,
  IRuleOption,
} from '../types';
import * as utils from './utils';

export class ChatUI {
  public isMobile: boolean;
  public chat: HTMLDivElement;
  public form: HTMLFormElement;
  public textArea: HTMLTextAreaElement;
  public inputText: HTMLInputElement;
  public input: HTMLInputElement | HTMLTextAreaElement;
  public submit: HTMLButtonElement;
  public typing: HTMLLIElement;
  public conversation: HTMLUListElement;
  private options: IChatOptions;
  private inputValue: string;

  constructor(isMobile: boolean, options: IChatOptions) {
    this.isMobile = isMobile;
    this.options = options;
    this.chat = this.createChat();
    this.typing = this.createTyping();
    this.conversation = this.createConversation();
    this.textArea = this.createTextarea();
    this.inputText = this.createInput();
    this.input = this.textArea;
    this.submit = this.createSubmit();
    this.form = this.createForm();
    this.conversation.appendChild(this.typing);
    this.chat.appendChild(this.conversation);
    this.chat.appendChild(this.form);
    this.inputValue = '';
  }

  public createSingleChoiceMessage(
    rule: IRule,
    onSelected: (label: string, value: string) => void
  ) {
    if (rule.options.length) {
      this.disableForm(this.options.inputPlaceholderSingleChoice);
      return this.createBubbleMessage(rule, (btn, list) => {
        list.remove();
        this.enableForm();
        onSelected(
          btn.getAttribute('data-label'),
          btn.getAttribute('data-value')
        );
      });
    }
    return document.createElement('div') as HTMLDivElement;
  }

  public createBubbleButton(
    option: IRuleOption,
    onClick: (btn: HTMLButtonElement) => void,
    opts?: { className?: string }
  ) {
    const btn = document.createElement('button') as HTMLButtonElement;
    btn.className = 'yvebot-message-bubbleBtn';
    if (opts && opts.className) {
      btn.classList.add(opts.className);
    }
    btn.onclick = () => onClick(btn);
    const { value, label } = option;
    btn.setAttribute(
      'data-value',
      String((value === undefined ? label : value) || '')
    );
    btn.setAttribute(
      'data-label',
      String((label === undefined ? value : label) || '')
    );
    btn.textContent = btn.getAttribute('data-label');
    return btn;
  }

  public disableForm(placeholder: string) {
    this.submit.disabled = true;
    this.input.disabled = true;
    this.input.placeholder = placeholder;
    this.inputValue = this.input.value;
    this.input.value = '';
  }

  public enableForm() {
    this.submit.disabled = false;
    this.input.disabled = false;
    this.input.placeholder = this.options.inputPlaceholder;
    this.input.value = this.inputValue;
    this.inputValue = '';

    if (this.options.autoFocus) {
      this.input.focus();

      if (this.isMobile) {
        // avoid losing scroll position on toggle form
        setTimeout(() => this.scrollDown(0, null, true), 500);
      }
    }
  }

  public createBubbleMessage(
    rule: IRule,
    onClick: (btn: HTMLButtonElement, list: HTMLDivElement) => void
  ) {
    const { maxOptions = 0 } = rule;
    const { moreOptionsLabel: label } = this.options;
    const bubbles = document.createElement('div') as HTMLDivElement;
    bubbles.className = `yvebot-message-bubbles yvebot-ruleType-${rule.type}`;

    const createButtonsPaginator = (options: IRuleOption[], start = 0) => {
      const end = !!maxOptions ? start + maxOptions - 1 : options.length;
      options.slice(start, end).forEach((opt, idx) => {
        const bubble = this.createBubbleButton(opt, btn => {
          onClick(btn, bubbles);
          if (rule.type !== 'MultipleChoice') {
            this.scrollDown(0, null, true);
          }
        });
        bubbles.appendChild(bubble);

        if (end < options.length && idx === maxOptions - 2) {
          const moreBtn = this.createBubbleButton(
            { label },
            () => {
              createButtonsPaginator(options, end);
              moreBtn.remove();
            },
            { className: 'yvebot-message-bubbleMoreOptions' }
          );
          bubbles.appendChild(moreBtn);
        }
      });
    };

    createButtonsPaginator(rule.options);
    return bubbles;
  }

  public createMultipleChoiceMessage(
    rule: IRule,
    onDone: (label: string[], value: string[]) => void
  ) {
    const message = document.createElement('div') as HTMLDivElement;

    if (rule.options.length) {
      const done = document.createElement('button') as HTMLButtonElement;
      done.textContent = this.options.doneMultipleChoiceLabel;
      done.className = 'yvebot-message-bubbleDone';
      done.style.display = 'none';

      const self = this;
      done.onclick = () => {
        const bubbles = done.previousElementSibling;
        const selected = bubbles.querySelectorAll(
          '.yvebot-message-bubbleBtn.selected'
        );
        const label = utils
          .nodeListToArray(selected)
          .map(b => b.getAttribute('data-label'));
        const value = utils
          .nodeListToArray(selected)
          .map(b => b.getAttribute('data-value'));
        onDone(label, value);
        bubbles.remove();
        done.remove();
        self.enableForm();
        self.scrollDown(0, null, true);
      };

      const bubbleMsg = this.createBubbleMessage(rule, btn => {
        btn.classList.toggle('selected');
        if (
          bubbleMsg.querySelectorAll('.yvebot-message-bubbleBtn.selected')
            .length
        ) {
          done.style.display = 'inline-block';
        } else {
          done.style.display = 'none';
        }
      });

      this.disableForm(this.options.inputPlaceholderMultipleChoice);

      message.appendChild(bubbleMsg);
      message.appendChild(done);
    }
    return message;
  }

  public createChat() {
    const chat = document.createElement('div') as HTMLDivElement;
    chat.className = 'yvebot-chat';
    return chat;
  }

  public createConversation() {
    const conversation = document.createElement('ul') as HTMLUListElement;
    conversation.className = 'yvebot-conversation';
    return conversation;
  }

  public createTyping() {
    const typing = document.createElement('div') as HTMLDivElement;
    typing.className = 'yvebot-typing';
    [1, 2, 3].forEach(() => {
      const dot = document.createElement('span') as HTMLSpanElement;
      dot.className = 'yvebot-typing-dot';
      typing.appendChild(dot);
    });
    return this.createThread('BOT', typing, 'yvebot-thread-typing');
  }

  public createForm() {
    const form = document.createElement('form') as HTMLFormElement;
    form.className = 'yvebot-form';
    form.appendChild(this.input);
    form.appendChild(this.submit);
    return form;
  }

  public createSubmit() {
    const submit = document.createElement('button') as HTMLButtonElement;
    submit.className = 'yvebot-form-submit';
    submit.type = 'submit';
    submit.textContent = this.options.submitLabel;
    return submit;
  }

  public createInput() {
    const input = document.createElement('input') as HTMLInputElement;
    input.className = 'yvebot-form-input';
    input.type = 'text';
    input.placeholder = this.options.inputPlaceholder;
    input.autocomplete = 'off';
    return input;
  }

  public createTextarea() {
    const textarea = document.createElement('textarea') as HTMLTextAreaElement;
    textarea.className = 'yvebot-form-input';
    textarea.placeholder = this.options.inputPlaceholder;
    textarea.rows = 1;
    // shift + enter
    textarea.addEventListener('keydown', e => {
      const code = e.key || e.keyCode || e.code;
      const isEnter = ['Enter', 13].indexOf(code) >= 0;
      if (isEnter && !e.shiftKey) {
        e.preventDefault();
        this.form.dispatchEvent(new Event('submit'));
      }
    });
    // autosize
    textarea.addEventListener('input', e => {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    });
    return textarea;
  }

  public createThread(
    source: ChatMessageSource,
    content: HTMLElement,
    customClass?: string
  ) {
    const thread = document.createElement('li') as HTMLLIElement;
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

    if (this.input !== element) {
      this.form.replaceChild(element, this.input);
      this.input = element;
    }

    if (this.options.autoFocus) {
      this.input.focus();
    }
  }

  public appendThread(
    source: ChatMessageSource,
    conversation: HTMLUListElement,
    thread: HTMLLIElement
  ) {
    this.scrollDown(
      thread.offsetHeight,
      () => conversation.insertBefore(thread, this.typing),
      source === 'USER'
    );
  }

  public scrollDown(
    offset: number,
    callback: () => void | null,
    force = false
  ) {
    /*
    * Avoid breakdown of reading when user changes the scroll and a new thread is appended
    */
    const isBottom =
      this.conversation.scrollHeight -
        this.conversation.scrollTop -
        this.conversation.offsetHeight -
        offset <=
      0;

    if (callback) {
      callback();
    }

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

    const bubble = document.createElement('div') as HTMLDivElement;
    bubble.className = 'yvebot-bubble';

    if (senderName) {
      const name = document.createElement('div') as HTMLDivElement;
      name.className = 'yvebot-sender';
      name.innerHTML = senderName;
      bubble.appendChild(name);
    }

    const message = document.createElement('div') as HTMLDivElement;
    message.className = 'yvebot-message';
    message.innerHTML = text;
    bubble.appendChild(message);

    if (timestampable) {
      const timestamp = document.createElement('div') as HTMLDivElement;
      timestamp.className = 'yvebot-timestamp';
      timestamp.innerHTML = timestampFormatter(Date.now());
      bubble.appendChild(timestamp);
    }

    return bubble;
  }
}
