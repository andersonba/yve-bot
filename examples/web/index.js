const express = require('express');

const app = express();

app.use('/', express.static(__dirname));
app.use('/chat.yaml', express.static(__dirname + '/../chat.yaml'));
app.use('/yvebot.js', express.static(__dirname + '/../../lib/yve.web.js'));

app.listen(3000, () => {
  console.log('Yve server example listening on port 3000');
});
