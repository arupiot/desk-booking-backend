const express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();

router.get('/email', secured(), (req, res) => {
    console.log('Sending email...', req, res);
    const msg = {
      to: 'rory.webber@arup.com',
      from: 'rory.webber@arupiot.com',
      subject: 'IoT Desk Sign in Notice',
      text: 'Signed in, have you?',
      html: '<strong>Signed in, have you?</strong>',
    };
    sgMail.send(msg);
    res.status(200).send('Email sent!');
  });

module.exports = router;