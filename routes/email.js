const express = require('express');
var router = express.Router();
var app = express();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

// Redirect root to /books
// app.route('/email').get((req,res) => {
//     console.log("recieved");
//     res.send("sent and recieved");
// });
// router.get('/email', (req, res) => {
//     console.log('Sending email...', req, res);
//     const msg = {
//       to: 'rory.webber@arup.com',
//       from: 'rory.webber@arupiot.com',
//       subject: 'IoT Desk Sign in Notice',
//       text: 'Signed in, have you?',
//       html: '<strong>Signed in, have you?</strong>',
//     };
//     sgMail.send(msg);
//     res.status(200).send('email sent!');
//   });

module.exports = router;