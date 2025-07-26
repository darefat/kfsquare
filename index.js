document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#contact-form');
  
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the default form submission

      // Get form values
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      // Basic validation
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      // Construct the email body
      const body = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;

      // Construct the mailto link
      const mailtoLink = `mailto:customersupport@kfsquare.com?subject=Contact Form Submission&body=${encodeURIComponent(body)}`;

      // Open the email client
      window.location.href = mailtoLink;

      // Reset form after submission
      form.reset();
    });
  }
});