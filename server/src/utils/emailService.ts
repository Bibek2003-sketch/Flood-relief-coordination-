import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // 1. If SMTP (e.g. Gmail) credentials are provided, send via Nodemailer
  if (emailUser && emailPass) {
    try {
      const cleanUser = emailUser.trim();
      const cleanPass = emailPass.replace(/\s+/g, '');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanUser,
          pass: cleanPass, // Google 16-character App Password
        },
      });

      const info = await transporter.sendMail({
        from: `"FloodRelief Emergency Response" <${cleanUser}>`,
        to: to.trim(),
        subject,
        html,
      });

      console.log(`[EMAIL SENT VIA GMAIL/SMTP] To: ${to} | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (smtpErr) {
      console.error('[SMTP EMAIL ERROR]:', smtpErr);
      throw smtpErr;
    }
  }

  // 2. If Resend API Key is provided, send via Resend
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: 'FloodRelief <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      console.log(`[EMAIL SENT VIA RESEND] To: ${to} | Data:`, data);
      return { success: true, data, provider: 'resend' };
    } catch (resendErr) {
      console.error('[RESEND EMAIL ERROR]:', resendErr);
      throw resendErr;
    }
  }

  // 3. Fallback: Simulation Mode when no email credentials exist
  console.log('====================================================');
  console.log('⚠️ [SIMULATION MODE - NO EMAIL PROVIDER CONFIGURED]');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Body Preview:');
  console.log(html.replace(/<[^>]*>?/gm, '').trim().slice(0, 300) + '...');
  console.log('----------------------------------------------------');
  console.log('👉 To receive real emails in your inbox, configure either:');
  console.log('   Option A (Gmail): Add EMAIL_USER and EMAIL_PASS to server/.env');
  console.log('   Option B (Resend): Add RESEND_API_KEY to server/.env');
  console.log('====================================================');

  return { id: 'simulated-id', status: 'simulated' };
};
