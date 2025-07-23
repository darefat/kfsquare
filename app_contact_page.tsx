export default function Contact() {
  return (
    <main>
      <section>
        <h2>Contact Us</h2>
        <form className="contact-form">
          <label>
            Name:
            <input type="text" name="name" required />
          </label>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
          <label>
            Message:
            <textarea name="message" required />
          </label>
          <button type="submit">Send</button>
        </form>
        <p>Email: info@kfquare.com</p>
        <p>Phone: +123-456-7890</p>
      </section>
    </main>
  );
}