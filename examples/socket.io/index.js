const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const yaml = require('js-yaml');
const YveBot = require('../../lib/yve.core');

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
        .on('typing', sid => io.to(sid).emit('is typing'))
        .on('typed', sid => io.to(sid).emit('is typed'))
        .on('talk', (message, data, sid) => {
          io.to(sid).emit('receive message', {
            from: 'BOT',
            message,
            data,
          });
        })
        .on('outputChanged', (store, sid) => io.to(sid).emit('store changed', store))
        .on('error', (err, sid) => {
          console.error(sid, err);
          io.to(sid).emit('error', err.message);
        })
        .on('end', (_, sid) => {
          if (io.sockets.sockets[sid]) {
            io.sockets.sockets[sid].disconnect();
          }
        })
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
