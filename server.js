require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { body, validationResult } = require('express-validator'); // For input validation

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.SENDGRID_API_KEY;
const recipientEmail = process.env.RECIPIENT_EMAIL;
const corsOrigin = process.env.CORS_ORIGIN;

if (!apiKey) {
  console.error("SendGrid API key is missing. Ensure SENDGRID_API_KEY is set in your environment.");
  process.exit(1); // Exit if the API key is not defined
}

sgMail.setApiKey(apiKey);

// Middleware
app.use(cors({
  origin: corsOrigin, // Allow only requests from your frontend
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Input validation middleware
const validate = [
  body('name').trim().notEmpty().escape().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('message').trim().notEmpty().escape().withMessage('Message is required')
];

// Endpoint to handle form submission
app.post('/send-email', validate, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  const msg = {
    to: recipientEmail,
    from: email, // Use the sender's email for reply-to. Consider using a dedicated "no-reply" address and setting `replyTo` to the user's email.
    subject: 'Contact Form Submission from KFSquare',
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message:</p><p>${message}</p>`, // HTML version
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
      res.status(200).send('Email sent successfully');
    })
    .catch((error) => {
      console.error("SendGrid Error:", error);
      if (error.response) {
        console.error("SendGrid Response Body:", error.response.body); // Log detailed SendGrid errors
      }
      res.status(500).send('Error sending email');
    });
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});