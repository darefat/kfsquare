document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#contact-form');

  form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    // Construct the email body
    const body = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;

    // Construct the mailto link
     const mailtoLink = `mailto:info@kfsquare.com?subject=Contact Form Submission&body=${encodeURIComponent(body)}`;

    // Open the email client
     window.location.href = mailtoLink;

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // sgMail.setDataResidency('eu');
    // uncomment the above line if you are sending mail using a regional EU subuser

    const msg = {
      to: 'info@kfsquare.com', // Change to your recipient
      from: email, // Change to your verified sender
      subject: 'Info from kfsquare.com site',
      text: message,
      html: message,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent');
    } catch (error) {
      console.error(error);
    }
  });
});