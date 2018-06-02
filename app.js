const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const analytics = require('./analytics');


// Require database connection
// const db = require('./db/');


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

const protectRoutes = type => function (req, res, next) {
  const tokenHeader = req.headers.authorization;

  if (tokenHeader) {
    const token = req.headers.authorization.split('Bearer ')[1];

    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        console.log('Error -- attempted to access protected route with token that failed verification');
        res.status(401).send({ message: 'ERROR' });
      } else if (decoded.userType !== type) {
        console.log('user type: ', decoded.userType, 'expected: ', type);
        console.log('Error -- attempted to access protected route with wrong token userType');

        res.status(401).send({ message: 'ERROR' });
      } else {
        next();
      }
    });
  } else {
    console.log('Error -- attempted to access protected route without a token');

    res.status(401).send({ message: 'ERROR' });
  }
};

// app.use('/restaurants', protectRoutes('Restaurant'));
// app.use('/customers', protectRoutes('Customer'));
// app.use('/', routes);

app.post('/build/:id', async (req, res) => {
  let {id} = req.params;
  let response = await analytics.buildData();
  res.status(200).send('OK');
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
