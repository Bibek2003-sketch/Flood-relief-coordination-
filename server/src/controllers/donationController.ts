import { Request, Response } from 'express';
import Donation from '../models/Donation';
import { sendEmail } from '../utils/emailService';

export const createDonation = async (req: Request, res: Response) => {
  try {
    const { donorName, email, amount, paymentType, supplyItem, quantity, notes } = req.body;

    if (!donorName || !email) {
      return res.status(400).json({ success: false, message: 'Donor name and email are required' });
    }

    const type = paymentType === 'supplies' ? 'supplies' : 'monetary';
    const numAmount = type === 'monetary' ? Number(amount) || 0 : 0;

    const receiptNumber = `RCPT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const donation = await Donation.create({
      donorName: donorName.trim(),
      email: email.toLowerCase().trim(),
      amount: numAmount,
      paymentType: type,
      supplyItem: supplyItem || undefined,
      quantity: quantity ? Number(quantity) : 1,
      receiptNumber,
      transactionId,
      status: type === 'monetary' ? 'completed' : 'pledged',
      notes: notes || undefined,
    });

    // Send confirmation email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
          <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 20px;">
            <h1 style="color: #06b6d4; margin: 0; font-size: 24px;">FloodRelief Disaster Response</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-family: monospace;">OFFICIAL DONATION RECEIPT • EOC LOGISTICS</p>
          </div>
          
          <p style="font-size: 15px;">Dear <strong>${donorName}</strong>,</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Thank you for supporting disaster relief operations in affected flood zones. Your contribution directly funds critical rescue boats, medical field camps, and survival ration supplies.
          </p>

          <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Receipt Number:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #38bdf8;">${receiptNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Transaction ID:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #cbd5e1;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Contribution Type:</td>
                <td style="padding: 6px 0; text-align: right; text-transform: uppercase; font-weight: bold;">${type}</td>
              </tr>
              ${type === 'monetary' ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Amount Contributed:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; font-size: 16px; color: #10b981;">₹${numAmount.toLocaleString('en-IN')}</td>
              </tr>
              ` : `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Material Supply Pledged:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #f59e0b;">${quantity}x ${supplyItem}</td>
              </tr>
              `}
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Status:</td>
                <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: bold;">${donation.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Date &amp; Time:</td>
                <td style="padding: 6px 0; text-align: right; color: #cbd5e1;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>
          </div>

          <div style="font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 20px;">
            <p style="margin: 0;">This contribution qualifies for 80G disaster relief tax exemption provisions. Please keep this receipt for your records.</p>
            <p style="margin: 4px 0 0 0;">Guwahati Central EOC Command • Emergency Help: 1070 / 112</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: `[FloodRelief] Donation Receipt ${receiptNumber} - Thank You!`,
        html: emailHtml,
      });
    } catch (mailErr) {
      console.warn('Failed to send donation receipt email:', mailErr);
    }

    // Broadcast to socket clients
    const io = req.app.get('io');
    if (io) {
      io.emit('donation-received', {
        receiptNumber,
        donorName,
        amount: numAmount,
        paymentType: type,
        supplyItem,
        quantity: donation.quantity,
        createdAt: donation.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: type === 'monetary'
        ? `Thank you! Your donation of ₹${numAmount} was processed successfully.`
        : `Thank you! Your pledge for ${donation.quantity}x ${supplyItem} has been registered with EOC Logistics.`,
      data: donation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDonationStats = async (req: Request, res: Response) => {
  try {
    const [totalStats, suppliesCount, recentDonations] = await Promise.all([
      Donation.aggregate([
        { $match: { paymentType: 'monetary' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            donorsCount: { $sum: 1 },
          },
        },
      ]),
      Donation.countDocuments({ paymentType: 'supplies' }),
      Donation.find().sort({ createdAt: -1 }).limit(8).select('donorName amount paymentType supplyItem quantity createdAt receiptNumber'),
    ]);

    const stats = totalStats[0] || { totalAmount: 0, donorsCount: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalAmount: stats.totalAmount,
        monetaryDonorsCount: stats.donorsCount,
        suppliesPledgedCount: suppliesCount,
        totalContributions: stats.donorsCount + suppliesCount,
        recentDonations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
