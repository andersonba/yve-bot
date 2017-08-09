import http from 'http';
import express from 'express';
import SocketIO from 'socket.io';
import bodyParser from 'body-parser';
import fs from 'fs';
import yaml from 'js-yaml';
import YveBot from '../../src/core';

const app = express();
const server = http.Server(app);
const io = SocketIO(server);

app.use(bodyParser.json());

const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../example.eyaml', 'utf8'));
const bot = new YveBot(example);

app.use('/', express.static(__dirname));

io.on('connection', chat => {
  const sessionId = chat.id;

  bot
  .on('typing', () => io.to(sessionId).emit('is typing'))
  .on('typed', () => io.to(sessionId).emit('is typed'))
  .on('talk', (message, data) => {
    io.to(sessionId).emit('receive message', {
      from: 'BOT',
      message,
      data,
    });
  })
  .on('outputChanged', store => io.to(sessionId).emit('store changed', store))
  .on('end', () => chat.disconnect());

  chat
    .on('join', () => {
      chat.emit('connected', sessionId);
      chat.join(sessionId);
      bot.session(sessionId).start();
    })
    .on('send message', ({ user, message }) => {
      io.to(user).emit('receive message', {
        message,
        from: 'USER',
      });

      bot.session(sessionId).hear(message);
    });
});

server.listen(3000, () => {
  console.log('Yve server example listening on port 3000');
});
