const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const { fetchData, buildData} = require('./analytics');

// Require configurations
let primaryServerSecret = null;
if (!process.env.SERVER_SECRET) {
  config = require('./config/secrets');
  primaryServerSecret = config.primaryServerSecret;
} else {
  primaryServerSecret = process.env.SERVER_SECRET
}

const app = express();

const port = process.env.PORT || 3000;
process.on('unhandledRejection', r => console.log(r));

app.use(cors());

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Simple loggin middleware
app.use('*', (req, res, next) => {
  console.log(`Server received request type ${req.method} to ${req.originalUrl}`);
  next();
});

app.post('/build/:id/:secret', async (req, res) => {
  let {id, secret} = req.params;

  if (secret === primaryServerSecret) {
    let response = await buildData(id);
    res.status(200).send('OK');
  } else {
    res.status(400).send('NO');
  }
});

app.get('/data/:id/:secret', async (req, res) => {
  let {id, secret} = req.params;
    if (secret === primaryServerSecret) {
      // let response = await fetchData(id);
      fetchData(id).then((data) => {
        console.log(data);
        // console.log(response);
        res.status(200).send(data[0].analytics);
      }).catch((err) => {
        console.log(err);
        res.status(400).send('NO');
      });
    } else {
      res.status(400).send('NO');
    }
});


// Note: the below console.log is intentional, and required for minimal server logging.
const server = app.listen(port, () => {
  console.log(`Starting the server at port ${port}`);
});

module.exports = app;
