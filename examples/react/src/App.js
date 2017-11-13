import React, { Component } from 'react';
import Chat from './Chat';

const rules = [
  'Hello to React example!',
  { type: 'String', message: 'What\'s your name?', name: 'name' },
  'Okay {name}! Enjoy it!'
];

class App extends Component {
  render() {
    return (
      <div className="App">
        <Chat rules={rules} />
      </div>
    );
  }
}

export default App;
