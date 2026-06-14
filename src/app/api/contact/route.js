import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }

    const db = getDb();
    
    // Save to Database
    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject, message]
    );
    console.log(`[Contact DB] Stored contact inquiry id: ${result.insertId} from ${email}`);

    // Send Email Alert
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER || 'info.clothship@gmail.com';
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpPass) {
      console.warn(`[Contact Alert] ⚠️ SMTP_PASS not set in .env — email notification skipped for ${email}. Message saved to DB.`);
      return NextResponse.json({ message: 'Your message has been sent successfully! We will get back to you soon.' });
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
        subject: `New Customer Inquiry: ${subject}`,
        text: `Hello Admin,\n\nYou have received a new inquiry from the storefront Contact Form.\n\nCustomer Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}\n\nDate: ${new Date().toLocaleString()}\n\nBest regards,\nCloth Ship Platform`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #8b6e4e; border-bottom: 2px solid #8b6e4e; padding-bottom: 10px; margin-top: 0;">New Customer Inquiry</h2>
            <p style="font-size: 15px;">Hello Admin,</p>
            <p style="font-size: 15px;">A user has submitted a new message through the storefront contact form:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="background-color: #fafafa;">
                <td style="padding: 10px; font-weight: bold; border: 1px solid #eee; width: 150px;">Customer Name:</td>
                <td style="padding: 10px; border: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #eee;">Email Address:</td>
                <td style="padding: 10px; border: 1px solid #eee; color: #0066cc;">${email}</td>
              </tr>
              <tr style="background-color: #fafafa;">
                <td style="padding: 10px; font-weight: bold; border: 1px solid #eee;">Phone Number:</td>
                <td style="padding: 10px; border: 1px solid #eee;">${phone || 'Not Provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #eee;">Inquiry Subject:</td>
                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #8b6e4e;">${subject}</td>
              </tr>
            </table>

            <div style="background-color: #fcfbf9; border-left: 4px solid #8b6e4e; padding: 15px; margin: 20px 0; font-style: italic; font-size: 14px; line-height: 1.6;">
              <strong style="display: block; font-style: normal; margin-bottom: 5px; color: #555;">Message Content:</strong>
              "${message.replace(/\n/g, '<br />')}"
            </div>

            <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
              Submitted on: ${new Date().toLocaleString()}<br />
              This is an automated notification from your storefront platform.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Contact Alert] Inquiry alert email successfully sent to info.clothship@gmail.com for ${email}`);
    } catch (emailError) {
      console.error('[Contact Alert] ❌ Failed to send email alert:', emailError.message);
      console.error('[Contact Alert] Make sure SMTP_PASS in .env is a Gmail App Password (not your regular password).');
      // Don't fail the HTTP request since database storage was successful
    }

    return NextResponse.json({ message: 'Your message has been sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact Form Error:', error);
    return NextResponse.json({ error: 'Failed to process inquiry. Please try again later.' }, { status: 500 });
  }
}
