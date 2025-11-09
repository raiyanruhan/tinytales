import nodemailer from 'nodemailer';

// Create transporter with hardcoded credentials
const transporter = nodemailer.createTransport({
  host: 'mail.tinytalesearth.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'no-reply@tinytalesearth.com',
    pass: 'bDkBHvKct_PTb9d+',
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates if needed
  }
});

// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(email, otp) {
  const mailOptions = {
    from: `"TinyTales" <no-reply@tinytalesearth.com>`,
    to: email,
    subject: 'Verify Your TinyTales Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Stylish', 'Nunito', Arial, sans-serif;
              line-height: 1.6;
              color: #283247;
              background-color: #FBF2E7;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #FFFFFF;
              border-radius: 24px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #F9E8D4;
            }
            .content {
              padding: 30px 20px;
            }
            .otp-box {
              background: linear-gradient(135deg, #44B090 0%, #6CB1DA 100%);
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 16px;
              margin: 30px 0;
              letter-spacing: 8px;
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              color: #666;
              font-size: 14px;
              border-top: 2px solid #F9E8D4;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #44B090; font-family: 'Barriecito', cursive;">TinyTales</h1>
            </div>
            <div class="content">
              <h2 style="color: #3B659F;">Verify Your Email Address</h2>
              <p>Thank you for signing up with TinyTales! Please use the verification code below to complete your registration:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't create an account with TinyTales, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TinyTales. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Verify Your TinyTales Account
      
      Thank you for signing up with TinyTales!
      
      Your verification code is: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account with TinyTales, please ignore this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}


