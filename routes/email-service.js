const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  const requestId = req.requestId || `email-${Date.now()}`;

  if (req.method !== "POST") {
    console.warn(`[${requestId}] email-service invalid method: ${req.method}`);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : smtpPort === 465;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const mailFrom =
    process.env.MAIL_FROM || `"Paperless Ticket" <${smtpUser || "no-reply@paperless.local"}>`;

  const { eventName, eventDate, userName, passCount, bookingId, userEmail } = req.body || {};

  console.log(
    `[${requestId}] email-service payload received bookingId=${bookingId || "n/a"} userEmail=${
      userEmail || "n/a"
    }`
  );

  if (!eventName || !eventDate || !userName || !passCount || !bookingId || !userEmail) {
    console.warn(`[${requestId}] email-service missing required fields`);
    return res.status(400).json({ message: "Missing required details" });
  }

  if (!smtpUser || !smtpPass) {
    console.error(`[${requestId}] email-service SMTP config missing`);
    return res.status(500).json({
      message: "Email configuration is missing. Set SMTP_USER and SMTP_PASS.",
    });
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

    await transporter.verify();
    console.log(`[${requestId}] email-service transporter verified`);

    const qrCodeBuffer = await QRCode.toBuffer(String(bookingId), {
      type: "png",
      width: 256,
      margin: 1,
    });

    const info = await transporter.sendMail({
      from: mailFrom,
      to: userEmail,
      subject: "Pass Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background: linear-gradient(to bottom, #111827, #000000); color: #ffffff; padding: 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden;">
            <div style="background: #1F2937; padding: 20px;">
              <h1 style="color: #FACC15; font-size: 36px; font-weight: bold;">
                Welcome to <span style="color: #EC4899;">Paperless Ticket</span>
              </h1>
              <p style="color: #9CA3AF; font-size: 16px; margin-top: 10px;">
                Seamlessly manage and explore events with our platform.
              </p>
            </div>
            <div style="background: #1E293B; padding: 20px; border: 1px solid #374151;">
              <h2 style="color: #3B82F6; font-size: 24px;">Your Booking QR Code</h2>
              <p style="color: #9CA3AF; margin-top: 10px;">Use this QR code at the entry point for check-in:</p>
              <img src="cid:qrcode" alt="QR Code" style="margin: 20px auto; width: 150px; height: 150px; border: 2px solid #FACC15; border-radius: 12px;" />
            </div>
            <div style="background: #1F2937; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: left; color: #9CA3AF;">
              <h2 style="color: #FACC15; text-align: center;">Event Details:</h2>
              <p><strong>Event Name:</strong> ${eventName}</p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Name:</strong> ${userName}</p>
              <p><strong>Pass Count:</strong> ${passCount}</p>
              <p><strong>Booking ID:</strong> ${bookingId}</p>
            </div>
            <div style="background: #1F2937; padding: 20px; color: #9CA3AF;">
              <p>If you have any questions, reach out at <a href="mailto:support@paperless.com" style="color: #3B82F6; text-decoration: none;">support@paperless.com</a>.</p>
              <p style="margin-top: 10px;">Enjoy the event! 🎶</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrCodeBuffer,
          cid: "qrcode",
        },
      ],
    });

    return res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(`[${requestId}] Email service error:`, error?.message || error);
    return res.status(500).json({
      message: "Failed to send email",
      error: error?.message || "Unknown email service error",
    });
  }
};

module.exports = sendEmail;
