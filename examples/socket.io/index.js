const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const yaml = require('js-yaml');
const YveBot = require('../../lib/core');

const app = express();
const server = http.Server(app);
const io = SocketIO(server);

const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../chat.yaml', 'utf8'));
const bot = new YveBot(example);

bot
  .on('typing', sid => io.to(sid).emit('typing'))
  .on('typed', sid => io.to(sid).emit('typed'))
  .on('talk', (message, data, sid) => {
    io.to(sid).emit('talk', {
      message,
      data,
    });
  })
  .on('storeChanged', (data, sid) => io.to(sid).emit('storeChanged', data))
  .on('error', (err, sid) => {
    console.error(sid, err);
    io.to(sid).emit('error', err.message);
  })
  .on('end', (_, sid) => {
    if (io.sockets.sockets[sid]) {
      io.sockets.sockets[sid].disconnect();
    }
  });

io.on('connection', chat => {
  chat
    .on('join', () => {
      chat.emit('connected', chat.id);
      chat.join(chat.id);
      bot.session(chat.id).start();
    })
    .on('reply', ({ sid, store, message }) => {
      bot.session(sid, { store }).hear(message);
    });
});

app.use(bodyParser.json());
app.use('/', express.static(__dirname));
app.use('/chat.css', express.static(__dirname + '/../web/chat.css'));
app.use('/ui.js', express.static(__dirname + '/../../lib/ui.js'));

server.listen(3000, () => {
  console.log('Yve server example listening on port 3000');
});
