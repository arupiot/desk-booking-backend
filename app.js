// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const express = require('express');
const config = require('./config');
const app = express();

// Added for auth0 routing
// var authRouter = require('./routes/auth');

// CORS middleware to allow the frontend to access /email
const cors = require ('cors');

// jwt middleware for auth0 authorization
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
const jwtAuthz = require('express-jwt-authz');
const checkScopes = jwtAuthz(['post:email']);

// // Added for auth0 login
// var session = require('express-session');
var dotenv = require('dotenv'); // Load environment variables from .env, may eventually change all the env variables to be in config later
dotenv.config();

// Load Passport
// var passport = require('passport');
// var Auth0Strategy = require('passport-auth0');

// SG mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var whitelist = ['http://localhost:4200', 'https://arup-iot-desk.firebaseapp.com']
var corsOptions = {
  
}

//CORS
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions));

// Middleware for checking JWT for auth0 authentication
const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://angular-authentication.eu.auth0.com/.well-known/jwks.json'
  }),

  // Validate the audience and the issuer
  audience: process.env.AUTH0_AUDIENCE,
  issuer: 'https://angular-authentication.eu.auth0.com/',
  algorithms: ['RS256']
});

function getModel () {
  return require(`./desks/model-${require('./config').get('DATA_BACKEND')}`);
}

// Email endpoint and api
app.post('/email', checkJwt, checkScopes, function(req,res){
  console.log(req.body.emails)
  console.log(req.params['email'])
  let emails = req.body.emails;
  let thisDesk = req.body.desk;
  let thisDeskID = req.body.desk.id;
  // remove the desk id so datastore doesn't make a new field
  // called 'id'
  delete thisDesk['id']; 

  thisDesk.booked = true;
  thisDesk.sign_in_time = new Date();
  thisDesk.sign_out_time = null;
  thisDesk.user_email = emails['email1'];

  getModel().update(thisDeskID, thisDesk, (err, savedData) => {
    if (err) {
      console.log('update error: ', err)
      return;
    }

    console.log('updated desk: ', savedData)
    
    const msg = {
      to: [emails['email1'], emails['email2']],
      from: 'jason.brewer@arup.com',
      subject: 'IoT Desk Sign in Notice',
      text: `
              Hello, you have successfully booked ${thisDesk.name}. Thanks!
            `,
      html: `
              <strong>Hello!</strong>
              </br>
              </br>
              You have successfully booked me.
              </br>
              </br>
              I'm all booked up until 5:30pm today.
              </br>
              </br>
              You have a great day.
              </br>
              </br>
              All the best,
              </br>
              </br>
              <strong>${thisDesk.name}</strong>
            `,
    };
    sgMail.send(msg);
    console.log('email sent!')
    res.status(200).send('email sent!');

  });
});

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);

// Books
app.use('/desks', require('./desks/crud'));
app.use('/api/desks', require('./desks/api'));

app.get('/', (req, res) => {
  res.redirect('/desks');
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something went horribly wrong!');
});

if (module === require.main) {
  // Start the server
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
