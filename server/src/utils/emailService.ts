import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// If no key is provided, we can simulate sending for testing
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  if (!resend) {
    console.log('--- SIMULATED EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log('-----------------------');
    console.log('Note: Add RESEND_API_KEY to .env to send real emails.');
    return { id: 'simulated-id-123', status: 'simulated' };
  }

  try {
    const data = await resend.emails.send({
      from: 'Flood Relief Admin <onboarding@resend.dev>', // resend.dev is allowed for testing unverified domains
      to: to,
      subject: subject,
      html: html,
    });
    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
};
