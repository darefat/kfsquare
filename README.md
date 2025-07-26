# KFQUARE - Data Analytics & Predictive Modeling

## Overview

KFQUARE is a data engineering and analytics company leveraging cutting-edge Large Language Models (LLM) to deliver predictive analysis and transformative insights for businesses. This website serves as a landing page to provide information about the company, its services, and contact details.

## Sections

*   **Home:** Introduces KFQUARE and its mission.
*   **About:** Provides more details about the company's mission and expertise.
*   **Services:** Lists the services offered by KFQUARE.
*   **Contact:** Displays contact information and a form for users to send messages.

## Technologies Used

*   HTML
*   CSS
*   JavaScript
*   Node.js (for server-side email handling)
*   Express (Node.js framework)
*   SendGrid (for email sending)
*   dotenv (for managing environment variables)
*   cors (for handling Cross-Origin Resource Sharing)
*   express-validator (for input validation)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd kfsquare-site/kfsquare
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add the following variables, replacing the placeholders with your actual values:

        ```
        SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
        RECIPIENT_EMAIL=info@kfsquare.com
        PORT=3000
        CORS_ORIGIN=http://localhost:5500 # Replace with your frontend URL in production
        ```

4.  **Run the server:**

    ```bash
    node server.js
    ```

5.  **Open `index.html` in your browser.**  It's recommended to use a development server (e.g., `serve`) to avoid CORS issues.

## Key Files

*   **`index.html`:** The main HTML file containing the website structure and content.
*   **`styles.css`:**  CSS file for styling the website.
*   **`script.js`:** JavaScript file for handling form submission and client-side logic.
*   **`server.js`:** Node.js server file for handling form submissions and sending emails via SendGrid.
*   **.env:** File for storing sensitive information like API keys and email addresses.

## Email Sending

The website includes a contact form that sends emails using SendGrid.  The server-side code handles the email sending process.

**Important:**

*   Make sure you have a SendGrid account and have created an API key with the necessary permissions.
*   Verify the "no-reply" email address with SendGrid to prevent emails from being marked as spam.

## CORS Configuration

The server uses CORS to allow requests from the frontend.  Make sure the `CORS_ORIGIN` environment variable is set to the correct URL of your frontend.

## Input Validation

The server uses `express-validator` to validate the form data on the server-side.

## Error Handling

The server includes error handling and logging to help identify and resolve issues.

## Production Deployment

When deploying to production:

*   Set the environment variables directly in your hosting environment.
*   Ensure that the CORS origin is set to the correct URL of your production frontend.
*   Consider using a process manager like PM2 to keep the server running.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

© 2025 KFSQUARE. All rights reserved.