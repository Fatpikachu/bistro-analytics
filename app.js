const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const analytics = require('./analytics');

// Require configurations
let primarySeverSecret = null;
if (!process.env.SERVER_SECRET) {
  config = require('../config/secrets');
  primarySeverSecret = config.primarySeverSecret;
} else {
  primarySeverSecret = process.env.SERVER_SECRET
}

const app = express();

const port = process.env.PORT || 3000;
process.on('unhandledRejection', r => console.log(r));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple loggin middleware
app.use('*', (req, res, next) => {
  console.log(`Server received request type ${req.method} to ${req.originalUrl}`);
  next();
});

app.post('/build/:id/:secret', async (req, res) => {
  let {id, secret} = req.params;

  if (secret === primarySeverSecret) {
    let response = await analytics.buildData(id);
    res.status(200).send('OK');
  } else {
    res.status(400).send('NO');
  }
});

app.get('/data/:id', async (req, res) => {
  let {id} = req.params;
  let response = await analytics.fetchData(id);
  res.status(200).send(response);
});


// Note: the below console.log is intentional, and required for minimal server logging.
const server = app.listen(port, () => {
  console.log(`Starting the server at port ${port}`);
});

module.exports = app;
