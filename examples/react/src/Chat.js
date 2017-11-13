import React, { Component } from 'react';
import YveBotUI from 'yve-bot/ui';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.bot = new YveBotUI(props.rules || [], {
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
