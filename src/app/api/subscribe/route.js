import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const db = getDb();
    
    // Save to Database
    try {
      await db.query('INSERT INTO subscribers (email) VALUES (?)', [email]);
      console.log(`[Subscription DB] Successfully stored email: ${email}`);
    } catch (dbError) {
      // Handle duplicate entry (already subscribed)
      if (dbError.code === 'ER_DUP_ENTRY') {
        console.log(`[Subscription DB] Duplicate email (already subscribed): ${email}`);
        return NextResponse.json({ message: 'Thank you for subscribing!' });
      }
      throw dbError; // rethrow other errors
    }

    // Send Email Notification
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER || 'info.clothship@gmail.com';
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpPass) {
      console.warn(`[Subscription Alert] ⚠️ SMTP_PASS not set in .env — email notification skipped for ${email}. Subscription saved to DB.`);
      return NextResponse.json({ message: 'Thank you for subscribing!' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"Cloth Ship Storefront" <${smtpUser}>`,
        to: 'info.clothship@gmail.com',
        subject: `New Newsletter Subscriber: ${email}`,
        text: `Hello Admin,\n\nA new user has subscribed to the Cloth Ship newsletter!\n\nEmail Address: ${email}\nSubscription Date: ${new Date().toLocaleString()}\n\nBest regards,\nCloth Ship Platform`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #8b6e4e; border-bottom: 1px solid #ddd; padding-bottom: 10px;">New Newsletter Subscriber</h2>
            <p style="font-size: 15px; line-height: 1.6;">Hello Admin,</p>
            <p style="font-size: 15px; line-height: 1.6;">A new user has subscribed to the Cloth Ship newsletter!</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 150px;">Email Address:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #0066cc;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Date & Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #777; margin-top: 25px;">This is an automated notification from your storefront platform.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Subscription Alert] Email notification successfully sent to info.clothship@gmail.com for ${email}`);
    } catch (emailError) {
      console.error('[Subscription Alert] ❌ Failed to send email notification:', emailError.message);
      console.error('[Subscription Alert] Make sure SMTP_PASS in .env is a Gmail App Password (not your regular password).');
      // We don't fail the request since database storage was successful
    }

    return NextResponse.json({ message: 'Thank you for subscribing!' });
  } catch (error) {
    console.error('Subscription Error:', error);
    return NextResponse.json({ error: 'Failed to process subscription. Please try again later.' }, { status: 500 });
  }
}
