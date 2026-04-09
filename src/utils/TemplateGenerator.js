export const generateEmailTemplate = (otp, name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SahiSpot | Email Verification</title>
  <style>
    body {
      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f7fa;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      animation: fadeIn 0.6s ease;
    }
    .header {
      background: linear-gradient(135deg, #0f766e, #134e4a);
      color: #fff;
      text-align: center;
      padding: 40px 20px;
    }
    .header h1 {
      font-size: 28px;
      margin: 0;
      letter-spacing: 1px;
    }
    .header p {
      font-size: 14px;
      margin-top: 8px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 12px;
      color: #111827;
      font-weight: 600;
    }
    .message {
      font-size: 15px;
      color: #444;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    .otp-box {
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      border-radius: 12px;
      padding: 20px 0;
      letter-spacing: 10px;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4);
      margin: 30px 0;
    }
    .info {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 15px;
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 600px) {
      .content { padding: 25px 20px; }
      .otp-box { font-size: 26px; letter-spacing: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SahiSpot</h1>
      <p>Mock Interview Platform</p>
    </div>

    <div class="content">
      <p class="greeting">Dear ${name},</p>
      <p class="message">
        Thank you for registering with <strong>SahiSpot</strong>. To proceed with your account setup and access our mock interview platform, please verify your email address using the One-Time Password (OTP) provided below.
      </p>

      <div class="otp-box">${otp}</div>

      <p class="message">
        Please note that this OTP will remain valid for <strong>10 minutes</strong>. For security reasons, do not share this code with anyone.
      </p>

      <div class="info">
        If you did not initiate this signup request, you may safely disregard this email.  
        For assistance, please contact our support team at <a href="mailto:support@sahispot.com">support@sahispot.com</a>.
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} SahiSpot — All Rights Reserved.<br/>
      Empowering Careers Through Practice and Preparation
    </div>
  </div>
</body>
</html>
`;

export const generateForgotPasswordTemplate = (otp, name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SahiSpot | Password Reset</title>
  <style>
    body {
      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f7fa;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      animation: fadeIn 0.6s ease;
    }
    .header {
      background: linear-gradient(135deg, #7c3aed, #4c1d95);
      color: #fff;
      text-align: center;
      padding: 40px 20px;
    }
    .header h1 {
      font-size: 28px;
      margin: 0;
      letter-spacing: 1px;
    }
    .header p {
      font-size: 14px;
      margin-top: 8px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 12px;
      color: #111827;
      font-weight: 600;
    }
    .message {
      font-size: 15px;
      color: #444;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    .otp-box {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      border-radius: 12px;
      padding: 20px 0;
      letter-spacing: 10px;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.4);
      margin: 30px 0;
    }
    .info {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 15px;
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }
    .footer {
      background: #f8fafc;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 600px) {
      .content { padding: 25px 20px; }
      .otp-box { font-size: 26px; letter-spacing: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SahiSpot</h1>
      <p>Password Reset Request</p>
    </div>

    <div class="content">
      <p class="greeting">Hello ${name},</p>

      <p class="message">
        We received a request to reset the password for your <strong>SahiSpot</strong> account.
        Please use the One-Time Password (OTP) below to proceed with resetting your password.
      </p>

      <div class="otp-box">${otp}</div>

      <p class="message">
        This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset,
        please ignore this email — your account remains secure.
      </p>

      <div class="info">
        For security reasons, never share this OTP with anyone.  
        Need help? Contact us at <a href="mailto:support@sahispot.com">support@sahispot.com</a>.
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} SahiSpot — All Rights Reserved.<br/>
      Empowering Careers Through Practice and Preparation
    </div>
  </div>
</body>
</html>
`;

export const generateContactUsTemplate = ({ name, email, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message | SahiSpot</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #eef2f7;
      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #111827;
    }

    .wrapper {
      padding: 48px 16px;
    }

    .container {
      max-width: 680px;
      margin: auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 55px rgba(0, 0, 0, 0.12);
    }

    .header {
      background: linear-gradient(135deg, #0f766e, #115e59);
      padding: 40px 24px;
      text-align: center;
      color: #ffffff;
    }

    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .header h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 700;
    }

    .content {
      padding: 42px 36px;
    }

    .section {
      margin-bottom: 26px;
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }

    .value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .email {
      color: #0f766e;
      text-decoration: none;
    }

    .message-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 5px solid #0f766e;
      padding: 22px;
      border-radius: 14px;
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      white-space: pre-line;
    }

    .footer {
      background: #f9fafb;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 600px) {
      .content {
        padding: 30px 22px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <div class="header">
        <div class="badge">New Message</div>
        <h1>Contact Form Submission</h1>
      </div>

      <div class="content">

        <div class="section">
          <div class="label">Sender Name</div>
          <div class="value">${name}</div>
        </div>

        <div class="section">
          <div class="label">Sender Email</div>
          <div class="value">
            <a href="mailto:${email}" class="email">${email}</a>
          </div>
        </div>

        <div class="section">
          <div class="label">Message</div>
          <div class="message-box">
            ${message}
          </div>
        </div>

      </div>

      <div class="footer">
      © ${new Date().getFullYear()} SahiSpot · Admin Notification
      </div>

    </div>
  </div>
</body>
</html>
`;

export const generateContactAutoReplyTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You for Contacting SahiSpot</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
    }

    .wrapper {
      padding: 40px 16px;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      padding: 36px 20px;
      text-align: center;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .content {
      padding: 38px 30px;
    }

    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #4b5563;
      margin-bottom: 22px;
    }

    .highlight {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 16px;
      border-radius: 10px;
      font-size: 14px;
      color: #1e3a8a;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #9ca3af;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 600px) {
      .content {
        padding: 28px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <div class="header">
        <h1>SahiSpot</h1>
      </div>

      <div class="content">
        <p class="greeting">Hello ${name},</p>

        <p class="text">
          Thank you for reaching out to <strong>SahiSpot</strong>!  
          We’ve successfully received your message and our support team will review it shortly.
        </p>

        <p class="text">
          We typically respond within <strong>24–48 hours</strong>. If your inquiry is urgent,
          please include additional details when replying to this email.
        </p>

        <div class="highlight">
          <strong>What’s next?</strong><br/>
          Our team will carefully review your message and get back to you as soon as possible.
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} SahiSpot — All Rights Reserved<br/>
        Need help? Contact us at
        <a href="mailto:support@sahispot.com" style="color:#2563eb;text-decoration:none;">
          support@sahispot.com
        </a>
      </div>

    </div>
  </div>
</body>
</html>
`;\n\n// ─── PARKING REMINDER (30 min / 10 min before expiry) ────────────────────────\nexport const generateParkingReminderTemplate = (name, locationName, endTime, minutesLeft) => `\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n  <title>SahiSpot | Parking Reminder</title>\n  <style>\n    body { margin:0; padding:0; background:#f0f4f8; font-family:'Poppins','Segoe UI',sans-serif; color:#1f2937; }\n    .wrapper { padding:40px 16px; }\n    .container { max-width:600px; margin:auto; background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.12); }\n    .header { background:linear-gradient(135deg,#f97316,#ea580c); padding:36px 24px; text-align:center; color:#fff; }\n    .header .icon { font-size:48px; margin-bottom:10px; }\n    .header h1 { margin:0; font-size:26px; font-weight:700; letter-spacing:0.5px; }\n    .header p { margin:6px 0 0; font-size:14px; opacity:0.9; }\n    .badge { display:inline-block; background:rgba(255,255,255,0.2); border-radius:999px; padding:4px 14px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }\n    .content { padding:40px 32px; }\n    .greeting { font-size:18px; font-weight:600; margin-bottom:12px; color:#111827; }\n    .text { font-size:15px; line-height:1.7; color:#4b5563; margin-bottom:20px; }\n    .info-card { background:#fff7ed; border:1px solid #fed7aa; border-left:5px solid #f97316; border-radius:12px; padding:20px 24px; margin:24px 0; }\n    .info-card .label { font-size:12px; color:#9a3412; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:4px; }\n    .info-card .value { font-size:17px; font-weight:700; color:#7c2d12; }\n    .timer { text-align:center; margin:28px 0; }\n    .timer .mins { font-size:56px; font-weight:800; color:#ea580c; line-height:1; }\n    .timer .mins-label { font-size:14px; color:#6b7280; margin-top:4px; }\n    .cta { display:block; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; text-decoration:none; text-align:center; border-radius:12px; padding:16px; font-size:16px; font-weight:700; margin:24px 0 0; box-shadow:0 4px 18px rgba(249,115,22,0.4); }\n    .footer { background:#f9fafb; text-align:center; padding:20px; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }\n    @media(max-width:600px){ .content{ padding:28px 20px; } }\n  </style>\n</head>\n<body>\n  <div class="wrapper">\n    <div class="container">\n      <div class="header">\n        <div class="badge">⏰ Parking Alert</div>\n        <div class="icon">🚗</div>\n        <h1>Your Parking Is Ending Soon!</h1>\n        <p>SahiSpot — Smart Parking Solutions</p>\n      </div>\n      <div class="content">\n        <p class="greeting">Hi \${name},</p>\n        <p class="text">Your parking session at <strong>\${locationName}</strong> is about to end. Please return to your vehicle or extend your booking to avoid overstay penalties.</p>\n        <div class="timer">\n          <div class="mins">\${minutesLeft}</div>\n          <div class="mins-label">MINUTES REMAINING</div>\n        </div>\n        <div class="info-card">\n          <div class="label">Parking Ends At</div>\n          <div class="value">\${endTime}</div>\n        </div>\n        <p class="text">⚠️ After your booking expires, a <strong>15-minute grace period</strong> applies. After that, overstay charges at <strong>2× the hourly rate</strong> will begin automatically.</p>\n        <a href="https://sahi-spotv.vercel.app/dashboard" class="cta">Extend My Parking Now →</a>\n      </div>\n      <div class="footer">© \${new Date().getFullYear()} SahiSpot — All Rights Reserved<br/>Need help? <a href="mailto:support@sahispot.com" style="color:#f97316;">support@sahispot.com</a></div>\n    </div>\n  </div>\n</body>\n</html>\n`;\n\n// ─── OVERSTAY PENALTY ALERT ───────────────────────────────────────────────────\nexport const generateOverstayAlertTemplate = (name, locationName, overstayCharge, graceEndTime) => `\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n  <title>SahiSpot | Overstay Penalty</title>\n  <style>\n    body { margin:0; padding:0; background:#fef2f2; font-family:'Poppins','Segoe UI',sans-serif; color:#1f2937; }\n    .wrapper { padding:40px 16px; }\n    .container { max-width:600px; margin:auto; background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 16px 48px rgba(239,68,68,0.15); }\n    .header { background:linear-gradient(135deg,#dc2626,#991b1b); padding:36px 24px; text-align:center; color:#fff; }\n    .header .icon { font-size:52px; margin-bottom:10px; }\n    .header h1 { margin:0; font-size:26px; font-weight:700; }\n    .header p { margin:6px 0 0; font-size:14px; opacity:0.88; }\n    .badge { display:inline-block; background:rgba(255,255,255,0.18); border-radius:999px; padding:4px 14px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }\n    .content { padding:40px 32px; }\n    .greeting { font-size:18px; font-weight:600; margin-bottom:12px; color:#111827; }\n    .text { font-size:15px; line-height:1.7; color:#4b5563; margin-bottom:20px; }\n    .penalty-card { background:#fef2f2; border:2px solid #fecaca; border-radius:14px; padding:24px; text-align:center; margin:24px 0; }\n    .penalty-card .label { font-size:13px; color:#991b1b; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }\n    .penalty-card .amount { font-size:44px; font-weight:800; color:#dc2626; }\n    .penalty-card .per { font-size:13px; color:#6b7280; margin-top:4px; }\n    .info-box { background:#fff7f7; border-left:4px solid #dc2626; border-radius:8px; padding:16px 20px; margin:20px 0; font-size:14px; color:#7f1d1d; line-height:1.6; }\n    .cta { display:block; background:linear-gradient(135deg,#dc2626,#b91c1c); color:#fff; text-decoration:none; text-align:center; border-radius:12px; padding:16px; font-size:16px; font-weight:700; margin:24px 0 0; box-shadow:0 4px 18px rgba(220,38,38,0.4); }\n    .footer { background:#f9fafb; text-align:center; padding:20px; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }\n    @media(max-width:600px){ .content{ padding:28px 20px; } }\n  </style>\n</head>\n<body>\n  <div class="wrapper">\n    <div class="container">\n      <div class="header">\n        <div class="badge">🚨 Overstay Alert</div>\n        <div class="icon">⚠️</div>\n        <h1>Overstay Penalty Has Started</h1>\n        <p>SahiSpot — Smart Parking Solutions</p>\n      </div>\n      <div class="content">\n        <p class="greeting">Hi \${name},</p>\n        <p class="text">Your parking session at <strong>\${locationName}</strong> has exceeded its booked time and the grace period has ended. <strong>Overstay charges are now active.</strong></p>\n        <div class="penalty-card">\n          <div class="label">Current Overstay Charge</div>\n          <div class="amount">₹\${overstayCharge}</div>\n          <div class="per">Charged at 2× the standard hourly rate</div>\n        </div>\n        <div class="info-box">\n          <strong>Grace Period Ended:</strong> \${graceEndTime}<br/>\n          Overstay charges accumulate every hour at <strong>2× your booked hourly rate</strong> until you extend or vacate the spot.\n        </div>\n        <p class="text">Please extend your booking immediately or vacate the parking spot to stop further charges.</p>\n        <a href="https://sahi-spotv.vercel.app/dashboard" class="cta">Extend My Booking Now →</a>\n      </div>\n      <div class="footer">© \${new Date().getFullYear()} SahiSpot — All Rights Reserved<br/>Need help? <a href="mailto:support@sahispot.com" style="color:#dc2626;">support@sahispot.com</a></div>\n    </div>\n  </div>\n</body>\n</html>\n`;\n\n// ─── BOOKING EXTENSION CONFIRMATION ──────────────────────────────────────────\nexport const generateExtensionConfirmTemplate = (name, locationName, newEndTime, extraHours, extraCharge) => `\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n  <title>SahiSpot | Booking Extended</title>\n  <style>\n    body { margin:0; padding:0; background:#f0fdf4; font-family:'Poppins','Segoe UI',sans-serif; color:#1f2937; }\n    .wrapper { padding:40px 16px; }\n    .container { max-width:600px; margin:auto; background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 16px 48px rgba(16,185,129,0.15); }\n    .header { background:linear-gradient(135deg,#059669,#064e3b); padding:36px 24px; text-align:center; color:#fff; }\n    .header .icon { font-size:52px; margin-bottom:10px; }\n    .header h1 { margin:0; font-size:26px; font-weight:700; }\n    .header p { margin:6px 0 0; font-size:14px; opacity:0.88; }\n    .badge { display:inline-block; background:rgba(255,255,255,0.18); border-radius:999px; padding:4px 14px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }\n    .content { padding:40px 32px; }\n    .greeting { font-size:18px; font-weight:600; margin-bottom:12px; color:#111827; }\n    .text { font-size:15px; line-height:1.7; color:#4b5563; margin-bottom:20px; }\n    .confirm-card { background:#f0fdf4; border:2px solid #a7f3d0; border-radius:14px; padding:24px; margin:24px 0; }\n    .row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #d1fae5; }\n    .row:last-child { border-bottom:none; }\n    .row-label { font-size:13px; color:#065f46; text-transform:uppercase; letter-spacing:0.5px; }\n    .row-value { font-size:15px; font-weight:700; color:#064e3b; }\n    .cta { display:block; background:linear-gradient(135deg,#059669,#047857); color:#fff; text-decoration:none; text-align:center; border-radius:12px; padding:16px; font-size:16px; font-weight:700; margin:24px 0 0; box-shadow:0 4px 18px rgba(5,150,105,0.4); }\n    .footer { background:#f9fafb; text-align:center; padding:20px; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }\n    @media(max-width:600px){ .content{ padding:28px 20px; } .row{ flex-direction:column; align-items:flex-start; gap:4px; } }\n  </style>\n</head>\n<body>\n  <div class="wrapper">\n    <div class="container">\n      <div class="header">\n        <div class="badge">✅ Extension Confirmed</div>\n        <div class="icon">🎉</div>\n        <h1>Parking Extended Successfully!</h1>\n        <p>SahiSpot — Smart Parking Solutions</p>\n      </div>\n      <div class="content">\n        <p class="greeting">Hi \${name},</p>\n        <p class="text">Great news! Your parking session at <strong>\${locationName}</strong> has been successfully extended. Here's a summary of the changes:</p>\n        <div class="confirm-card">\n          <div class="row">\n            <span class="row-label">Location</span>\n            <span class="row-value">\${locationName}</span>\n          </div>\n          <div class="row">\n            <span class="row-label">Extended By</span>\n            <span class="row-value">\${extraHours} Hour\${Number(extraHours) > 1 ? 's' : ''}</span>\n          </div>\n          <div class="row">\n            <span class="row-label">New End Time</span>\n            <span class="row-value">\${newEndTime}</span>\n          </div>\n          <div class="row">\n            <span class="row-label">Extra Charge</span>\n            <span class="row-value">₹\${extraCharge}</span>\n          </div>\n        </div>\n        <p class="text">You're all set! Enjoy your extended parking. You'll receive a reminder before the new end time.</p>\n        <a href="https://sahi-spotv.vercel.app/dashboard" class="cta">View My Bookings →</a>\n      </div>\n      <div class="footer">© \${new Date().getFullYear()} SahiSpot — All Rights Reserved<br/>Need help? <a href="mailto:support@sahispot.com" style="color:#059669;">support@sahispot.com</a></div>\n    </div>\n  </div>\n</body>\n</html>\n`;
