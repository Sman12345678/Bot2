const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Verify webhook endpoint
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === 'your_verify_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

// Handle incoming messages
app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      let senderId = webhookEvent.sender.id;
      if (webhookEvent.message) {
        handleMessage(senderId, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderId, webhookEvent.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to handle messages
function handleMessage(senderId, message) {
  let text = message.text;

  // Check if message starts with #
  if (text.startsWith('#')) {
    handleCommand(senderId, text);
  } else {
    // Handle regular messages
    // Example: Echo back the received message
    sendTextMessage(senderId, `Echo: ${text}`);
  }
}

// Function to handle commands
function handleCommand(senderId, command) {
  // Example: Split command to extract command and parameters
  let parts = command.split(' ');
  let cmd = parts[0].substring(1); // Remove '#'
  let params = parts.slice(1);

  switch (cmd.toLowerCase()) {
    case 'addadmin':
      // Check if senderId is an admin (pseudo logic)
      if (senderId === 'admin_uid_here') {
        // Add admin logic here
        sendTextMessage(senderId, `Added admin with UID: ${params[0]}`);
      } else {
        sendTextMessage(senderId, 'You are not authorized to add admins.');
      }
      break;
    // Add more commands as needed
    default:
      sendTextMessage(senderId, `Unknown command: ${cmd}`);
  }
}

// Function to send text message to user
function sendTextMessage(senderId, text) {
  let messageData = {
    recipient: {
      id: senderId
    },
    message: {
      text: text
    }
  };

  callSendAPI(messageData);
}

// Function to call Send API
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v12.0/me/messages',
    qs: { access_token: '471126485696185|6P-uuRX9O3UAM7oEDfzxrD3c9rM' },
    method: 'POST',
    json: messageData
  }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      console.log('Message sent successfully');
    } else {
      console.error('Unable to send message:', err);
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
