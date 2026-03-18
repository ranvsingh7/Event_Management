import { Resend } from "resend";
import QRCode from "qrcode";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    // ✅ QR generate (base64)
    const qrCode = await QRCode.toDataURL(String(bookingId));

    // ✅ Send Email
    const response = await resend.emails.send({
      from: "Paperless Ticket <onboarding@resend.dev>", // temporary sender
      to: userEmail,
      subject: "Pass Booking Confirmation",
      html: `
        <div style="font-family: Arial; background: #111; color: #fff; padding:20px; text-align:center;">
          <h1 style="color:#FACC15;">Paperless Ticket 🎟️</h1>
          <h2 style="color:#3B82F6;">Booking Confirmed</h2>

          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Pass Count:</strong> ${passCount}</p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>

          <p style="margin-top:20px;">Scan this QR at entry:</p>
          <img src="${qrCode}" width="150" style="border-radius:10px;" />

          <p style="margin-top:20px;">Enjoy your event 🎶</p>
        </div>
      `,
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

export default sendEmail;