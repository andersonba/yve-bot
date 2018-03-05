const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const yaml = require('js-yaml');
const YveBot = require('../../lib/core');

require('dotenv').config();

const example = yaml.safeLoad(fs.readFileSync(__dirname + '/../chat.yaml', 'utf8'));
const bot = new YveBot(example);

const DATABASE = {};

bot
  .on('typing', (sid) =>
    sendMessage(sid, { sender_action: 'typing_on' }))
  .on('typed', (sid) =>
    sendMessage(sid, { sender_action: 'typing_off' }))
  .on('talk', async (text, data, sid) => {
    const message = { text };
    if (data.options && data.options.length) {
      message.quick_replies = data.options.map(o => ({
        content_type: 'text',
        title: o.label || o.value,
        payload: o.value || o.label,
      }));
    }
    await sendMessage(sid, { message });
  })
  .on('storeChanged', (data, sid) => {
    DATABASE[sid] = data;
  })
  .on('end', (data, sid) => {
    console.log(`[${sid}] Finished:`, data)
    delete DATABASE[sid];
  });

async function sendMessage(sid, { message, sender_action }) {
  console.log(`[${sid}] Sent: ${message && message.text || sender_action}`);

  try {
    const response = await axios({
      method: 'post',
      url: 'https://graph.facebook.com/v2.6/me/messages',
      params: { access_token: process.env.ACCESS_TOKEN },
      data: {
        message_type: 'RESPONSE',
        recipient: { id: sid },
        message,
        sender_action,
      },
    });
  } catch (err) {
    console.error(`[${sid}] Error:`, err.response.data);
  }
}

async function receiveMessage(event) {
  const sid = event.sender.id;
  const text = event.message.text;

  console.log(`[${sid}] Received: ${text}`);

  const store = DATABASE[sid] || {};
  bot.session(sid, { store })
    .hear(text)
    .start();
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          receiveMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

app.get('/', (_, res) => res.send('OK'));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Server listening on port %d', server.address().port);
});
