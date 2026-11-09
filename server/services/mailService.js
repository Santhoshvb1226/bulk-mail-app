const sendMail = async ({ to, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Bulk Mail App', email: process.env.MAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo error ${response.status}: ${text}`);
  }
};

module.exports = { sendMail };