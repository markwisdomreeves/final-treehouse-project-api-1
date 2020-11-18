'use strict';

const express = require('express');
const morgan = require('morgan');
const sequelize = require('./database').sequelize;
const user = require('./routes/user');
const course = require('./routes/course');

// Import cors to allow access to other resources from client to an other on the servers
const cors = require('cors');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// setup request body Json parsing.
const app = express();

app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// Enable all CORS Requests
app.use(cors());

console.log('Testing the connection to the database...');
(async () => {
  try {
    // all asynchronous calls made with Sequelize
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection to the database successful!');
  } catch(error) {
    // catch and display Sequelize validation errors
    console.log('Connection to the database failed!');
    throw error;
  }
})();


// TODO setup your api routes here
app.use('/api', user);
app.use('/api', course);

// setup a friendly greeting for the root route
app.use('/', (req, res) => {
  res.send('Welcome to my REST API!')
});


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});


// set our port
app.set('port', process.env.PORT || 5000);
// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});


