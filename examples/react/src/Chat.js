import React, { Component } from 'react';
import YveBot from 'yve-bot/ui';
import 'yve-bot/ext/types/StringSearch';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.bot = new YveBot(props.rules || [], {
      target: '.Chat',
    });
  }

  componentDidMount() {
    this.bot.start();
  }

  render() {
    return (
      <div className="Chat" />
    );
  }
}

export default Chat;
