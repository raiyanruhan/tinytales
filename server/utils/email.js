import nodemailer from 'nodemailer';

// Logo image URL
const LOGO_URL = 'https://raw.githubusercontent.com/raiyanruhan/tinytales/refs/heads/main/image.png';

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');
            body { 
              font-family: 'Nunito', Arial, sans-serif; 
              line-height: 1.6; 
              color: #283247; 
              background: #FFFFFF;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #FFFFFF; 
              border-radius: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
              overflow: hidden;
            }
            .header { 
              background: #FFFFFF;
              text-align: center; 
              padding: 48px 24px;
              border-bottom: 2px solid #6CB1DA;
            }
            .logo-img {
              max-width: 180px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .content { 
              padding: 48px 32px;
              background: #FFFFFF;
            }
            .title {
              font-family: 'Fredoka', cursive;
              font-size: 28px;
              font-weight: 600;
              color: #3B659F;
              text-align: center;
              margin: 0 0 24px 0;
            }
            .message {
              font-size: 16px;
              color: #3B659F;
              text-align: center;
              margin: 0 0 32px 0;
              padding: 24px;
              background: #FFFFFF;
              border-radius: 16px;
              border-left: 4px solid #6CB1DA;
              line-height: 1.7;
            }
            .otp-box {
              background: #FFFFFF;
              color: #3B659F;
              font-size: 36px;
              font-weight: 700;
              text-align: center;
              padding: 32px;
              border-radius: 16px;
              margin: 32px 0;
              letter-spacing: 8px;
              border: 3px solid #6CB1DA;
              font-family: 'Fredoka', cursive;
            }
            .expiry-notice {
              text-align: center;
              font-size: 14px;
              color: #3B659F;
              margin: 24px 0 0 0;
            }
            .footer { 
              text-align: center; 
              padding: 32px 24px; 
              background: #FFFFFF;
              color: #3B659F; 
              font-size: 13px;
              border-top: 1px solid #E1E1E1;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #3B659F;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 12px;
              }
              .container {
                border-radius: 16px;
              }
              .header {
                padding: 32px 20px;
              }
              .logo-img {
                max-width: 140px;
              }
              .content {
                padding: 32px 24px;
              }
              .title {
                font-size: 24px;
              }
              .otp-box {
                font-size: 28px;
                padding: 24px;
                letter-spacing: 6px;
              }
              .message {
                padding: 20px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="TinyTales" class="logo-img" />
            </div>
            <div class="content">
              <h2 class="title">Verify Your Email Address</h2>
              <div class="message">
                Thank you for signing up with TinyTales! Please use the verification code below to complete your registration:
              </div>
              <div class="otp-box">${otp}</div>
              <p class="expiry-notice">
                This code will expire in 10 minutes.
              </p>
              <p style="text-align: center; font-size: 14px; color: #3B659F; margin-top: 32px;">
                If you didn't create an account with TinyTales, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p><strong>TinyTales</strong> - Premium Children's Apparel</p>
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
    console.error('Error sending verification email:', error);
    console.error('Email configuration:', {
      host: transporter.options.host,
      port: transporter.options.port,
      secure: transporter.options.secure,
      from: mailOptions.from,
      to: mailOptions.to
    });
    throw error;
  }
}

// Send order confirmation email to user
export async function sendOrderConfirmationEmail(email, order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0; text-align: center;">${item.size || 'One Size'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0; text-align: right;">Tk ${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = order.shipping?.cost || 0;
  const grandTotal = total + shippingCost;

  const mailOptions = {
    from: `"TinyTales" <no-reply@tinytalesearth.com>`,
    to: email,
    subject: `Order Confirmed! - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');
            body { 
              font-family: 'Nunito', Arial, sans-serif; 
              line-height: 1.6; 
              color: #283247; 
              background: #FFFFFF;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #FFFFFF; 
              border-radius: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
              overflow: hidden;
            }
            .header { 
              background: #FFFFFF;
              text-align: center; 
              padding: 48px 24px;
              border-bottom: 2px solid #6CB1DA;
            }
            .logo-img {
              max-width: 180px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .content { 
              padding: 48px 32px;
              background: #FFFFFF;
            }
            .title {
              font-family: 'Fredoka', cursive;
              font-size: 28px;
              font-weight: 600;
              color: #3B659F;
              text-align: center;
              margin: 0 0 16px 0;
            }
            .subtitle {
              text-align: center;
              font-size: 16px;
              color: #3B659F;
              margin: 0 0 32px 0;
            }
            .order-number { 
              background: #FFFFFF; 
              color: #3B659F; 
              font-size: 22px; 
              font-weight: 700; 
              text-align: center; 
              padding: 24px; 
              border-radius: 16px; 
              margin: 32px 0;
              border: 3px solid #6CB1DA;
              font-family: 'Fredoka', cursive;
            }
            .section-title {
              font-family: 'Fredoka', cursive;
              font-size: 20px;
              font-weight: 600;
              color: #3B659F;
              margin: 32px 0 16px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 24px 0;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            thead tr {
              background: #FFFFFF;
            }
            th {
              padding: 14px 12px;
              text-align: left;
              font-weight: 700;
              color: #3B659F;
              font-family: 'Fredoka', cursive;
              font-size: 14px;
            }
            td {
              padding: 14px 12px;
              border-bottom: 1px solid #F0F0F0;
              font-size: 14px;
            }
            tbody tr:last-child td {
              border-bottom: none;
            }
            .total-box {
              background: #FFFFFF;
              padding: 24px;
              border-radius: 16px;
              margin: 24px 0;
              text-align: right;
              border: 1px solid #E1E1E1;
            }
            .total-box p {
              margin: 8px 0;
              font-size: 15px;
            }
            .grand-total {
              font-size: 24px !important;
              color: #3B659F !important;
              font-weight: 700 !important;
              font-family: 'Fredoka', cursive !important;
              margin-top: 12px !important;
            }
            .address-box {
              background: #FFFFFF;
              padding: 24px;
              border-radius: 16px;
              margin: 24px 0;
              border-left: 4px solid #6CB1DA;
            }
            .address-box p {
              margin: 6px 0;
              font-size: 15px;
              color: #3B659F;
            }
            .cta-box {
              text-align: center;
              margin: 32px 0;
              padding: 20px;
              background: #FFFFFF;
              border-radius: 16px;
            }
            .cta-link {
              display: inline-block;
              padding: 16px 32px;
              background: #FFFFFF;
              color: #3B659F;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 700;
              font-family: 'Fredoka', cursive;
              font-size: 16px;
              border: 3px solid #6CB1DA;
            }
            .footer { 
              text-align: center; 
              padding: 32px 24px; 
              background: #FFFFFF;
              color: #3B659F; 
              font-size: 13px;
              border-top: 1px solid #E1E1E1;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #3B659F;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 12px;
              }
              .container {
                border-radius: 16px;
              }
              .header {
                padding: 32px 20px;
              }
              .logo-img {
                max-width: 140px;
              }
              .content {
                padding: 32px 24px;
              }
              .title {
                font-size: 24px;
              }
              .order-number {
                font-size: 18px;
                padding: 20px;
              }
              table {
                font-size: 12px;
              }
              th, td {
                padding: 10px 8px;
              }
              .section-title {
                font-size: 18px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="TinyTales" class="logo-img" />
            </div>
            <div class="content">
              <h2 class="title">Order Confirmed!</h2>
              <p class="subtitle">Thank you for your order! We've received it and will process it with care.</p>
              <div class="order-number">Order #${order.orderNumber}</div>
              <h3 class="section-title">Order Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Size</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div class="total-box">
                <p><strong>Subtotal: Tk ${total.toFixed(2)}</strong></p>
                <p><strong>Shipping: Tk ${shippingCost.toFixed(2)}</strong></p>
                <p class="grand-total">Total: Tk ${grandTotal.toFixed(2)}</p>
              </div>
              <h3 class="section-title">Shipping Address</h3>
              <div class="address-box">
                <p>${order.address.streetAddress || ''}</p>
                <p>${order.address.cityArea || ''}, ${order.address.regionState || ''}</p>
                <p>${order.address.zipPostalCode || ''}</p>
                <p>Bangladesh</p>
              </div>
              <div class="cta-box">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #3B659F;">Don't have an account?</p>
                <a href="#" class="cta-link" style="color: #3B659F;">Create Account to Track Orders</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>TinyTales</strong> - Premium Children's Apparel</p>
              <p>&copy; ${new Date().getFullYear()} TinyTales. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    console.error('Email error details:', {
      email: email,
      orderId: order.id,
      error: error.message || error,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}

// Send admin notification email
export async function sendAdminOrderNotificationEmail(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F0F0F0; text-align: right;">Tk ${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const mailOptions = {
    from: `"TinyTales" <no-reply@tinytalesearth.com>`,
    to: 'raiyanbinrashid0@gmail.com',
    subject: `New Order Received! - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');
            body { 
              font-family: 'Nunito', Arial, sans-serif; 
              line-height: 1.6; 
              color: #283247; 
              background: #FFFFFF;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #FFFFFF; 
              border-radius: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
              overflow: hidden;
            }
            .header { 
              background: #FFFFFF;
              text-align: center; 
              padding: 48px 24px;
              border-bottom: 2px solid #F39265;
            }
            .logo-img {
              max-width: 180px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .content { 
              padding: 48px 32px;
              background: #FFFFFF;
            }
            .title {
              font-family: 'Fredoka', cursive;
              font-size: 28px;
              font-weight: 600;
              color: #F39265;
              text-align: center;
              margin: 0 0 16px 0;
            }
            .subtitle {
              text-align: center;
              font-size: 16px;
              color: #3B659F;
              margin: 0 0 32px 0;
            }
            .order-number { 
              background: #FFFFFF;
              border: 3px solid #F39265; 
              color: #F39265; 
              font-size: 22px; 
              font-weight: 700; 
              text-align: center; 
              padding: 24px; 
              border-radius: 16px; 
              margin: 32px 0;
              font-family: 'Fredoka', cursive;
            }
            .section-title {
              font-family: 'Fredoka', cursive;
              font-size: 20px;
              font-weight: 600;
              color: #3B659F;
              margin: 32px 0 16px 0;
            }
            .info-box {
              background: #FFFFFF;
              padding: 24px;
              border-radius: 16px;
              margin: 24px 0;
              border-left: 4px solid #6CB1DA;
            }
            .info-box p {
              margin: 8px 0;
              font-size: 15px;
              color: #3B659F;
            }
            .info-box strong {
              color: #3B659F;
              font-weight: 600;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 24px 0;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            thead tr {
              background: #FFFFFF;
            }
            th {
              padding: 14px 12px;
              text-align: left;
              font-weight: 700;
              color: #3B659F;
              font-family: 'Fredoka', cursive;
              font-size: 14px;
            }
            td {
              padding: 14px 12px;
              border-bottom: 1px solid #F0F0F0;
              font-size: 14px;
            }
            tbody tr:last-child td {
              border-bottom: none;
            }
            .total-box {
              background: #FFFFFF;
              padding: 24px;
              border-radius: 16px;
              margin: 24px 0;
              text-align: right;
              border: 1px solid #E1E1E1;
            }
            .total-box p {
              margin: 8px 0;
              font-size: 20px;
              color: #F39265;
              font-weight: 700;
              font-family: 'Fredoka', cursive;
            }
            .cta-box {
              text-align: center;
              margin: 32px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 18px 40px;
              background: #FFFFFF;
              color: #3B659F;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 700;
              font-family: 'Fredoka', cursive;
              font-size: 18px;
              border: 3px solid #6CB1DA;
            }
            .footer { 
              text-align: center; 
              padding: 32px 24px; 
              background: #FFFFFF;
              color: #3B659F; 
              font-size: 13px;
              border-top: 1px solid #E1E1E1;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #3B659F;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 12px;
              }
              .container {
                border-radius: 16px;
              }
              .header {
                padding: 32px 20px;
              }
              .logo-img {
                max-width: 140px;
              }
              .content {
                padding: 32px 24px;
              }
              .title {
                font-size: 24px;
              }
              .order-number {
                font-size: 18px;
                padding: 20px;
              }
              table {
                font-size: 12px;
              }
              th, td {
                padding: 10px 8px;
              }
              .section-title {
                font-size: 18px;
              }
              .cta-button {
                padding: 16px 32px;
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="TinyTales" class="logo-img" />
            </div>
            <div class="content">
              <h2 class="title">New Order Received!</h2>
              <p class="subtitle">A new order has been placed and needs your attention.</p>
              <div class="order-number">Order #${order.orderNumber}</div>
              <h3 class="section-title">Customer Information</h3>
              <div class="info-box">
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Name:</strong> ${order.address.firstName || ''} ${order.address.lastName || ''}</p>
                <p><strong>Phone:</strong> ${order.address.mobileNumber || ''}</p>
              </div>
              <h3 class="section-title">Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div class="total-box">
                <p>Total: Tk ${total.toFixed(2)}</p>
              </div>
              <div class="cta-box">
                <a href="#" class="cta-button">View Order in Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>TinyTales</strong> - Premium Children's Apparel</p>
              <p>&copy; ${new Date().getFullYear()} TinyTales. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    console.error('Email error details:', {
      orderId: order.id,
      error: error.message || error,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}

// Send order status update email to user
export async function sendOrderStatusEmail(email, order, status, shipperName) {
  const statusConfig = {
    'approved': {
      title: 'Order Approved',
      message: 'Your order has been approved and is being processed!',
      color: '#3B659F',
      bgGradient: '#FFFFFF',
      borderColor: '#6CB1DA'
    },
    'refused': {
      title: 'Order Not Processed',
      message: 'Unfortunately, your order could not be processed at this time. Please contact us if you have questions.',
      color: '#F77FB2',
      bgGradient: '#FFFFFF',
      borderColor: '#F77FB2'
    },
    'awaiting_processing': {
      title: 'Order Awaiting Processing',
      message: 'Your order is waiting to be processed. We will get to it soon!',
      color: '#FBC326',
      bgGradient: '#FFFFFF',
      borderColor: '#FBC326'
    },
    'order_confirmation': {
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being prepared with care!',
      color: '#3B659F',
      bgGradient: '#FFFFFF',
      borderColor: '#6CB1DA'
    },
    'shipped': {
      title: 'Order Shipped',
      message: shipperName ? `Your order is on the way via ${shipperName}!` : 'Your order has been shipped and is on its way to you!',
      color: '#3B659F',
      bgGradient: '#FFFFFF',
      borderColor: '#6CB1DA'
    },
    'delivered': {
      title: 'Order Delivered',
      message: 'Your order has been delivered! We hope you love it!',
      color: '#3B659F',
      bgGradient: '#FFFFFF',
      borderColor: '#6CB1DA'
    }
  };

  const config = statusConfig[status] || {
    title: 'Order Status Update',
    message: 'Your order status has been updated.',
    color: '#3B659F',
    bgGradient: '#FFFFFF',
    borderColor: '#6CB1DA'
  };

  const mailOptions = {
    from: `"TinyTales" <no-reply@tinytalesearth.com>`,
    to: email,
    subject: `${config.title} - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');
            body { 
              font-family: 'Nunito', Arial, sans-serif; 
              line-height: 1.6; 
              color: #283247; 
              background: #FFFFFF;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #FFFFFF; 
              border-radius: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
              overflow: hidden;
            }
            .header { 
              background: #FFFFFF;
              text-align: center; 
              padding: 48px 24px;
              border-bottom: 2px solid ${config.borderColor || config.color};
            }
            .logo-img {
              max-width: 180px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .content { 
              padding: 48px 32px;
              background: #FFFFFF;
            }
            .status-title {
              font-family: 'Fredoka', cursive;
              font-size: 28px;
              font-weight: 600;
              color: ${config.color};
              text-align: center;
              margin: 0 0 24px 0;
            }
            .status-box { 
              background: #FFFFFF;
              color: ${config.color}; 
              font-size: 22px; 
              font-weight: 700; 
              text-align: center; 
              padding: 24px; 
              border-radius: 16px; 
              margin: 32px 0;
              border: 3px solid ${config.borderColor || config.color};
              font-family: 'Fredoka', cursive;
            }
            .message {
              font-size: 16px;
              color: #3B659F;
              text-align: center;
              margin: 24px 0;
              padding: 24px;
              background: #FFFFFF;
              border-radius: 16px;
              border-left: 4px solid ${config.color};
              line-height: 1.7;
            }
            .order-number {
              background: #FFFFFF;
              padding: 20px;
              border-radius: 16px;
              text-align: center;
              margin: 24px 0;
              font-weight: 600;
              color: #3B659F;
              font-size: 16px;
              border: 1px solid #E1E1E1;
            }
            .order-number strong {
              color: ${config.color};
            }
            .footer { 
              text-align: center; 
              padding: 32px 24px; 
              background: #FFFFFF;
              color: #3B659F; 
              font-size: 13px;
              border-top: 1px solid #E1E1E1;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #3B659F;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 12px;
              }
              .container {
                border-radius: 16px;
              }
              .header {
                padding: 32px 20px;
              }
              .logo-img {
                max-width: 140px;
              }
              .content {
                padding: 32px 24px;
              }
              .status-title {
                font-size: 24px;
              }
              .status-box {
                font-size: 18px;
                padding: 20px;
              }
              .message {
                padding: 20px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="TinyTales" class="logo-img" />
            </div>
            <div class="content">
              <h2 class="status-title">${config.title}</h2>
              <div class="status-box">
                Order #${order.orderNumber}
              </div>
              <div class="message">
                ${config.message}
              </div>
              ${shipperName ? `
                <div class="order-number">
                  Shipping with: <strong>${shipperName}</strong>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p><strong>TinyTales</strong> - Premium Children's Apparel</p>
              <p>&copy; ${new Date().getFullYear()} TinyTales. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order status email:', error);
    console.error('Email error details:', {
      email: email,
      orderId: order.id,
      status: status,
      error: error.message || error,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}

// Send order cancellation email
export async function sendOrderCancellationEmail(email, order, cancelledBy) {
  const cancelledByText = cancelledBy === 'admin' ? 'by our team' : 'by you';

  const mailOptions = {
    from: `"TinyTales" <no-reply@tinytalesearth.com>`,
    to: email,
    subject: `Order Cancelled - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap');
            body { 
              font-family: 'Nunito', Arial, sans-serif; 
              line-height: 1.6; 
              color: #283247; 
              background: #FFFFFF;
              margin: 0;
              padding: 20px;
              -webkit-font-smoothing: antialiased;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #FFFFFF; 
              border-radius: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
              overflow: hidden;
            }
            .header { 
              background: #FFFFFF;
              border-bottom: 2px solid #F77FB2;
              text-align: center; 
              padding: 48px 24px;
            }
            .logo-img {
              max-width: 180px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            .content { 
              padding: 48px 32px;
              background: #FFFFFF;
            }
            .title {
              font-family: 'Fredoka', cursive;
              font-size: 28px;
              font-weight: 600;
              color: #F77FB2;
              text-align: center;
              margin: 0 0 24px 0;
            }
            .cancelled-box { 
              background: #FFFFFF;
              border: 3px solid #F77FB2; 
              color: #F77FB2; 
              font-size: 22px; 
              font-weight: 700; 
              text-align: center; 
              padding: 24px; 
              border-radius: 16px; 
              margin: 32px 0;
              font-family: 'Fredoka', cursive;
            }
            .message {
              font-size: 16px;
              color: #3B659F;
              text-align: center;
              margin: 24px 0;
              padding: 24px;
              background: #FFFFFF;
              border-radius: 16px;
              border-left: 4px solid #F77FB2;
              line-height: 1.7;
            }
            .support-note {
              text-align: center;
              font-size: 15px;
              color: #3B659F;
              margin: 32px 0 0 0;
              padding: 20px;
              background: #FFFFFF;
              border-radius: 16px;
            }
            .footer { 
              text-align: center; 
              padding: 32px 24px; 
              background: #FFFFFF;
              color: #3B659F; 
              font-size: 13px;
              border-top: 1px solid #E1E1E1;
            }
            .footer p {
              margin: 8px 0;
            }
            .footer strong {
              color: #3B659F;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 12px;
              }
              .container {
                border-radius: 16px;
              }
              .header {
                padding: 32px 20px;
              }
              .logo-img {
                max-width: 140px;
              }
              .content {
                padding: 32px 24px;
              }
              .title {
                font-size: 24px;
              }
              .cancelled-box {
                font-size: 18px;
                padding: 20px;
              }
              .message {
                padding: 20px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="TinyTales" class="logo-img" />
            </div>
            <div class="content">
              <h2 class="title">Order Cancelled</h2>
              <div class="message">
                Your order has been cancelled ${cancelledByText}.
              </div>
              <div class="cancelled-box">
                Order #${order.orderNumber}<br>
                <span style="font-size: 16px; opacity: 0.9;">CANCELLED</span>
              </div>
              <div class="support-note">
                If you have any questions or concerns, please contact our support team. We're here to help!
              </div>
            </div>
            <div class="footer">
              <p><strong>TinyTales</strong> - Premium Children's Apparel</p>
              <p>&copy; ${new Date().getFullYear()} TinyTales. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order cancellation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    console.error('Email error details:', {
      email: email,
      orderId: order.id,
      cancelledBy: cancelledBy,
      error: error.message || error,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}
