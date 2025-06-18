


// const QRCode = require('qrcode');
// const nodemailer = require('nodemailer');
// const path = require('path');

// const sendEmail = async (req, res) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: "getpass787@gmail.com",
//       pass: "cyqgvpzbyaazvqeo",
//     },
//   });

//   const bookingId = "123456789"; // Replace with dynamic booking ID
//   const qrCodePath = path.join(__dirname, 'qrcode.png');

//   // Generate QR Code as a file
//   await QRCode.toFile(qrCodePath, bookingId);

//   let info = await transporter.sendMail({
//     from: '"PaperLess" <ranvsingh7@gmail.com>',
//     to: "rs7877763051@gmail.com",
//     subject: "Pass Booking Confirmation",
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <div style="text-align: center; background-color: #f7f7f7; padding: 20px;">
//           <h1 style="color: #4CAF50;">🎉 Welcome to PaperLess 🎉</h1>
//           <p style="font-size: 16px;">Your trusted brand for seamless event management solutions.</p>
//         </div>
//         <div style="text-align: center; margin-top: 30px;">
//           <h2 style="color: #DB2777;">Your Booking QR Code</h2>
//           <p>Use this QR code at the entry point for check-in:</p>
//           <img src="cid:qrcode" alt="QR Code" style="margin-top: 10px; width: 150px; height: 150px;" />
//         </div>
//         <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px auto; background-color: #ffffff; max-width: 600px; text-align: left;">
//   <h2 style="color: #4CAF50; text-align: center;">Event Details:</h2>
//   <p><strong>Event Name:</strong> Music Fest 2025</p>
//   <p><strong>Date:</strong> June 20, 2025</p>
//   <p><strong>Venue:</strong> Royal Hall, Downtown</p>
//   <p style="margin-top: 20px;"><strong>Pass Type:</strong> VIP Pass</p>
//   <p><strong>Booking ID:</strong> ${bookingId}</p>
// </div>

//         <div style="text-align: center; margin-top: 30px;">
//           <p>If you have any questions, feel free to reach out to us at <a href="mailto:support@paperless.com">support@paperless.com</a>.</p>
//           <p>Enjoy the event! 🎶</p>
//         </div>
//         <div style="background-color: #f7f7f7; text-align: center; padding: 10px; font-size: 12px; color: #999;">
//           <p>© 2025 PaperLess. All rights reserved.</p>
//         </div>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: 'qrcode.png',
//         path: qrCodePath,
//         cid: 'qrcode', // Attach the file and reference it in the email
//       },
//     ],
//   });

//   res.status(200).json({ message: "Email sent successfully", info });
// };

// module.exports = sendEmail;


const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "getpass787@gmail.com",
      pass: "cyqgvpzbyaazvqeo",
    },
  });

  // Extract details from req.body
  const { eventName, eventDate, userName, passCount, bookingId } = req.body;

  if (!eventName || !eventDate || !userName || !passCount || !bookingId) {
    return res.status(400).json({ message: "Missing required details" });
  }

  const qrCodePath = path.join(__dirname, 'qrcode.png');

  // Generate QR Code for the booking ID
  await QRCode.toFile(qrCodePath, bookingId);

  let info = await transporter.sendMail({
  from: '"Paperless Ticket" <ranvsingh7@gmail.com>',
  to: req.body.userEmail,
  subject: "Pass Booking Confirmation",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background: linear-gradient(to bottom, #111827, #000000); color: #ffffff; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden;">
        <div style="background: #1F2937; padding: 20px;">
          <h1 style="color: #FACC15; font-size: 36px; font-weight: bold;">
            Welcome to <span style="color: #EC4899;">Paperless Ticket</span>
          </h1>
          <p style="color: #9CA3AF; font-size: 16px; margin-top: 10px;">
            Seamlessly manage and explore events with our platform. Whether you're here to discover exciting events or host your own, we've got you covered!
          </p>
        </div>
        <div style="background: #1E293B; padding: 20px; border: 1px solid #374151;">
          <h2 style="color: #3B82F6; font-size: 24px;">Your Booking QR Code</h2>
          <p style="color: #9CA3AF; margin-top: 10px;">
            Use this QR code at the entry point for check-in:
          </p>
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
          <p>If you have any questions, feel free to reach out to us at 
            <a href="mailto:support@paperless.com" style="color: #3B82F6; text-decoration: none;">
              support@paperless.com
            </a>.
          </p>
          <p style="margin-top: 10px;">Enjoy the event! 🎶</p>
        </div>
        <div style="background: #111827; padding: 10px; font-size: 12px; color: #9CA3AF;">
          <p>© 2025 Paperless Ticket. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  attachments: [
    {
      filename: 'qrcode.png',
      path: qrCodePath,
      cid: 'qrcode', // Attach the file and reference it in the email
    },
  ],
});


  res.status(200).json({ message: "Email sent successfully", info });
};

module.exports = sendEmail;
