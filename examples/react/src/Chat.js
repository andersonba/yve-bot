import React, { Component } from 'react';
import YveBot from 'yve-bot/ui';
import './Chat.css';
require('yve-bot/ext/types/StringSearch')(YveBot);

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
      <div className="Chat"></div>
    );
  }
}

export default Chat;
