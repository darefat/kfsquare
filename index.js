document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#contact form');

  form.addEventListener('submit', function(event) {
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