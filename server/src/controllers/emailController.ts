import { Request, Response } from 'express';
import { sendEmail } from '../utils/emailService';
import { AuthRequest } from '../middleware/auth';

export const dispatchRescueEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { toEmail, victimName, eta } = req.body;

    if (!toEmail) {
      return res.status(400).json({ status: 'error', message: 'Victim email is required' });
    }

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0891b2;">Emergency Rescue Update</h2>
        <p>Dear ${victimName || 'Citizen'},</p>
        <p>We have received your SOS request and a rescue team has been dispatched to your location.</p>
        <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0;">
          <strong>Estimated Time of Arrival (ETA):</strong> ${eta || 'As soon as possible'}
        </div>
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>Stay exactly where you are if it is safe to do so.</li>
          <li>Conserve your phone battery.</li>
          <li>Keep a bright piece of clothing ready to wave at the rescue boat/helicopter.</li>
        </ul>
        <p>Stay safe,<br>Flood Relief Coordination Team</p>
      </div>
    `;

    const result = await sendEmail({
      to: toEmail,
      subject: '🚨 Rescue Team Dispatched - Help is on the way',
      html: htmlTemplate
    });

    res.status(200).json({ status: 'success', data: result, message: 'Rescue email dispatched successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
