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
  chat
    .on('join', () => {
      chat.bot = bot.session(chat.id);
      chat.bot
        .on('typing', () => io.to(chat.id).emit('is typing'))
        .on('typed', () => io.to(chat.id).emit('is typed'))
        .on('talk', (message, data) => {
          io.to(chat.id).emit('receive message', {
            from: 'BOT',
            message,
            data,
          });
        })
        .on('outputChanged', store => io.to(chat.id).emit('store changed', store))
        .on('error', err => {
          console.error(err);
          io.to(chat.id).emit('error', err.message);
        })
        .on('end', () => chat.disconnect())
        .start();

      chat.emit('connected', chat.id);
      chat.join(chat.id);
    })
    .on('send message', ({ user, message }) => {
      io.to(user).emit('receive message', {
        message,
        from: 'USER',
      });

      chat.bot.hear(message);
    });
});

server.listen(3000, () => {
  console.log('Yve server example listening on port 3000');
});
