const { Resend } = require("resend");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");

const sendEmail = async (req, res) => {
  const requestId = req.requestId || `email-${Date.now()}`;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    eventName,
    eventDate,
    userName,
    passCount,
    bookingId,
    userEmail,
  } = req.body || {};

  console.log(`[${requestId}] Payload →`, req.body);

  if (!eventName || !eventDate || !userName || !passCount || !bookingId || !userEmail) {
    return res.status(400).json({ message: "Missing required details" });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        message: "Email configuration missing",
        error: "RESEND_API_KEY is not set",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const bookingCode = String(bookingId).toUpperCase().trim();

    // Inline QR (reliable in most clients when sent as cid attachment)
    const qrCodeBuffer = await QRCode.toBuffer(bookingCode, {
      type: "png",
      width: 320,
      margin: 1,
    });

    // Inline barcode (Code128)
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: bookingCode,
      scale: 3,
      height: 14,
      includetext: true,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
    });

    // ✅ Send Email
    const response = await resend.emails.send({
      from: process.env.MAIL_FROM || "Paperless Ticket <onboarding@resend.dev>",
      to: userEmail,
      subject: "Pass Booking Confirmation",
      html: `
        <div style="margin:0;padding:26px 12px;background:linear-gradient(180deg,#0b1220 0%,#15112a 50%,#070b15 100%);font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#e2e8f0;">
          <div style="max-width:640px;margin:0 auto;border:1px solid rgba(34,211,238,0.24);border-radius:20px;overflow:hidden;background:rgba(15,23,42,0.9);box-shadow:0 18px 40px rgba(2,6,23,0.45);">
            <div style="padding:24px 22px;background:linear-gradient(135deg,#0b1220 0%,#111827 58%,#1f1140 100%);text-align:center;border-bottom:1px solid rgba(34,211,238,0.2);">
              <div style="display:inline-block;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#67e8f9;background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.35);">Paperless Ticket</div>
              <h1 style="margin:12px 0 6px;font-size:30px;line-height:1.2;font-weight:800;color:#f8fafc;">Booking Confirmed 🎟️</h1>
              <p style="margin:0;color:#94a3b8;font-size:14px;">Your digital pass is ready for quick entry.</p>
            </div>

            <div style="padding:20px 22px 8px;">
              <div style="border:1px solid rgba(34,211,238,0.25);border-radius:16px;padding:16px;background:linear-gradient(180deg,rgba(34,211,238,0.08),rgba(236,72,153,0.07));text-align:center;">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#cbd5e1;">Scan QR at entry</p>
                <img src="cid:booking-qr" width="170" height="170" alt="Booking QR" style="display:block;margin:0 auto;border-radius:14px;border:2px solid #facc15;background:#ffffff;padding:8px;" />
              </div>

              <div style="margin-top:14px;border:1px solid rgba(148,163,184,0.22);border-radius:16px;padding:16px;background:rgba(15,23,42,0.66);text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#cbd5e1;">Barcode fallback</p>
                <img src="cid:booking-barcode" width="290" alt="Booking Barcode" style="display:block;margin:0 auto;max-width:100%;border-radius:10px;background:#ffffff;padding:8px;" />
                <p style="margin:10px 0 0;font-size:13px;color:#a5b4fc;">Booking ID: <span style="font-weight:700;color:#f8fafc;">${bookingCode}</span></p>
                <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">If images are blocked, open attachments: <strong>booking-qr.png</strong> or <strong>booking-barcode.png</strong>.</p>
              </div>

              <div style="margin-top:14px;border:1px solid rgba(148,163,184,0.22);border-radius:16px;padding:14px 16px;background:rgba(15,23,42,0.66);">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#67e8f9;font-weight:700;">Event Details</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#e2e8f0;">
                  <tr><td style="padding:7px 0;color:#94a3b8;">Event</td><td style="padding:7px 0;text-align:right;font-weight:700;color:#f8fafc;">${eventName}</td></tr>
                  <tr><td style="padding:7px 0;color:#94a3b8;">Date</td><td style="padding:7px 0;text-align:right;font-weight:700;color:#f8fafc;">${eventDate}</td></tr>
                  <tr><td style="padding:7px 0;color:#94a3b8;">Name</td><td style="padding:7px 0;text-align:right;font-weight:700;color:#f8fafc;">${userName}</td></tr>
                  <tr><td style="padding:7px 0;color:#94a3b8;">Passes</td><td style="padding:7px 0;text-align:right;font-weight:700;color:#f8fafc;">${passCount}</td></tr>
                </table>
              </div>
            </div>

            <div style="padding:14px 22px 22px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:13px;">Need help? <a href="mailto:support@paperlessticket.com" style="color:#67e8f9;text-decoration:none;">support@paperlessticket.com</a></p>
              <p style="margin:10px 0 0;color:#64748b;font-size:12px;">Enjoy your event and have a great time 🎶</p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "booking-qr.png",
          content: qrCodeBuffer,
          contentType: "image/png",
          contentId: "booking-qr",
        },
        {
          filename: "booking-barcode.png",
          content: barcodeBuffer,
          contentType: "image/png",
          contentId: "booking-barcode",
        },
      ],
    });

    console.log(`[${requestId}] Email sent:`, response);

    return res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error(`[${requestId}] ERROR:`, error);
    return res.status(500).json({
      message: "Email failed",
      error: error.message,
    });
  }
};

module.exports = sendEmail;