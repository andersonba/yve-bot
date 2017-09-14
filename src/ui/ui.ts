import { Answer, Rule, RuleOption, ChatOptions, ChatMessageSource } from '../types';
import * as utils from './utils';

export class ChatUI {
  private options: ChatOptions;
  public chat: HTMLDivElement;
  public form: HTMLFormElement;
  public input: HTMLInputElement;
  public submit: HTMLButtonElement;
  public typing: HTMLLIElement;
  public conversation: HTMLUListElement;

  constructor(options: ChatOptions) {
    this.options = options;
    this.chat = this.createChat();
    this.typing = this.createTyping();
    this.conversation = this.createConversation();
    this.input = this.createInput();
    this.submit = this.createSubmit();
    this.form = this.createForm(this.input, this.submit);
    this.conversation.appendChild(this.typing);
    this.chat.appendChild(this.conversation);
    this.chat.appendChild(this.form);
  }

  createSingleChoiceMessage(
    rule: Rule,
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

  createBubbleButton(option: RuleOption, onClick: (btn: HTMLButtonElement) => void) {
    const btn = document.createElement('button');
    btn.className = 'yvebot-message-bubbleBtn';
    btn.onclick = () => onClick(btn);
    const value = option.value ? String(option.value) : '';
    const label = option.label;
    btn.setAttribute('data-value', value || label);
    btn.setAttribute('data-label', label || value);
    btn.textContent = btn.getAttribute('data-label');
    return btn;
  }

  disableForm(placeholder: string) {
    this.submit.disabled = true;
    this.input.disabled = true;
    this.input.placeholder = placeholder;
  }

  enableForm() {
    this.submit.disabled = false;
    this.input.disabled = false;
    this.input.placeholder = this.options.inputPlaceholder;

    if (this.options.autoFocus) {
      this.input.focus();
    }
  }

  createBubbleMessage(rule: Rule, onClick: (btn: HTMLButtonElement, list: HTMLDivElement) => void) {
    const bubbles = document.createElement('div');
    bubbles.className = 'yvebot-message-bubbles';
    rule.options.forEach(opt => {
      const bubble = this.createBubbleButton(opt, (btn) => onClick(btn, bubbles));
      bubbles.appendChild(bubble);
    });
    return bubbles;
  }

  createMultipleChoiceMessage(
    rule: Rule,
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
        const label = utils.nodeListToArray(selected).map(b => b.getAttribute('data-label'));
        const value = utils.nodeListToArray(selected).map(b => b.getAttribute('data-value'));
        onDone(label, value);
        bubbles.remove();
        done.remove();
        self.enableForm();
      }

      const bubbles = this.createBubbleMessage(rule, (btn) => {
        btn.classList.toggle('selected');
        if (bubbles.querySelectorAll('.yvebot-message-bubbleBtn.selected').length) {
          done.style.display = 'inline-block';
        } else {
          done.style.display = 'none';
        }
      });

      this.disableForm(this.options.inputPlaceholderMutipleChoice);

      message.appendChild(bubbles);
      message.appendChild(done);
    }
    return message;
  }

  createChat() {
    const chat = document.createElement('div');
    chat.className = 'yvebot-chat';
    return chat;
  }

  createConversation() {
    const conversation = document.createElement('ul');
    conversation.className = 'yvebot-conversation';
    return conversation;
  }

  createTyping() {
    const typing = document.createElement('div');
    typing.className = 'yvebot-typing';
    [1, 2, 3].forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'yvebot-typing-dot';
      typing.appendChild(dot);
    });
    return this.createThread('BOT', typing, 'yvebot-thread-typing');
  }

  createForm(input: HTMLInputElement, submit: HTMLButtonElement) {
    const form = document.createElement('form');
    form.className = 'yvebot-form';
    form.appendChild(input);
    form.appendChild(submit);
    return form;
  }

  createSubmit() {
    const submit = document.createElement('button');
    submit.className = 'yvebot-form-submit';
    submit.type = 'submit';
    submit.textContent = this.options.submitLabel;
    return submit;
  }

  createInput() {
    const input = document.createElement('input');
    input.className = 'yvebot-form-input';
    input.type = 'text';
    input.placeholder = this.options.inputPlaceholder;
    input.autocomplete = 'off';
    return input;
  }

  createThread(source: ChatMessageSource, content: HTMLElement, customClass?: string) {
    const thread = document.createElement('li');
    thread.className = `yvebot-thread yvebot-thread-${source.toLowerCase()}`;
    if (customClass) {
      thread.classList.add(customClass);
    }
    thread.appendChild(content);
    return thread;
  }

  appendThread(conversation: HTMLUListElement, thread: HTMLLIElement) {
    conversation.insertBefore(thread, this.typing);
    conversation.scrollTop = conversation.scrollHeight;
  }

  createTextMessage(answer: Answer | Answer[]) {
    let text: string;

    if (answer instanceof Array) {
      const answers = (answer as string[]).map(a => String(a));
      text = utils.arrayToString(answers, this.options.andSeparatorText);
    } else {
      text = String(answer);
    }

    const message = document.createElement('div');
    message.className = 'yvebot-message';
    message.innerHTML = text;
    return message;
  }

}
