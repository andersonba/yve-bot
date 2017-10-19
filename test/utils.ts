import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function loadYamlFile(path: string): any {
  const filename = `${__dirname}/yamls/${path}.yaml`;
  const content = fs.readFileSync(filename, 'utf8');
  return loadYaml(content);
}

export function loadYaml(content: string): any {
  return yaml.safeLoad(content);
}

export function sleep(time: number = 0): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function getChatElements(selector: string = 'body') {
  const target = document.querySelector(selector);
  const form = target.querySelector('.yvebot-form') as HTMLFormElement;
  const input = target.querySelector('.yvebot-form-input') as HTMLInputElement;
  const submit = target.querySelector('.yvebot-form-submit') as HTMLButtonElement;
  const conversation = target.querySelector('.yvebot-conversation') as HTMLDivElement;
  const getMessages = () => target.querySelectorAll('.yvebot-message') as NodeListOf<HTMLDivElement>;
  const getBotMessages = () => target.querySelectorAll('.yvebot-thread-bot .yvebot-message') as NodeListOf<HTMLDivElement>;
  const getUserMessages = () => target.querySelectorAll('.yvebot-thread-user .yvebot-message') as NodeListOf<HTMLDivElement>;
  const getBubbleButtons = () => target.querySelectorAll('.yvebot-message-bubbleBtn') as NodeListOf<HTMLButtonElement>;
  const getBubbleDone = () => target.querySelector('.yvebot-message-bubbleDone') as HTMLButtonElement;
  const getTyping = () => target.querySelector('.yvebot-thread-typing') as HTMLLIElement;
  const getSenderName = () => target.querySelector('.yvebot-sender') as HTMLDivElement;
  return {
    target,
    form,
    conversation,
    input,
    submit,
    getMessages,
    getBotMessages,
    getUserMessages,
    getBubbleButtons,
    getBubbleDone,
    getTyping,
    getSenderName,
  };
}
