# Email Configuration Guide

## Quick Setup

1. **Run the setup script** (automatically creates `.env` with correct settings):
   ```bash
   cd server
   node setup-env.js
   ```

2. **Or manually create/Edit `.env` file** in the `server` directory:
   ```
   JWT_SECRET=tinytales-secret-key-2024-change-in-production
   SMTP_HOST=mail.tinytalesearth.com
   SMTP_PORT=465
   SMTP_USER=no-reply@tinytalesearth.com
   SMTP_PASS=tinytales@@
   NODE_ENV=development
   PORT=3001
   ```

3. **Restart the server** after updating `.env`

## Current Email Configuration

- **Email Address**: no-reply@tinytalesearth.com
- **SMTP Host**: mail.tinytalesearth.com
- **SMTP Port**: 465 (SSL)
- **IMAP Port**: 993
- **POP3 Port**: 995

## Common Issues

### Error: "535 Incorrect authentication data"
- **Cause**: Wrong email password or username
- **Solution**: 
  - Verify `SMTP_PASS` in `server/.env` matches your email account password
  - Verify `SMTP_USER` matches your email address
  - Some email providers require an "App Password" instead of your regular password

### Error: "Cannot connect to email server"
- **Cause**: Wrong SMTP host or port
- **Solution**: 
  - Check `SMTP_HOST` and `SMTP_PORT` in `server/.env`
  - Common ports: 465 (SSL), 587 (TLS), 25 (unsecured)

### Error: "Email service is not configured"
- **Cause**: `SMTP_PASS` is missing or empty
- **Solution**: Set `SMTP_PASS` in `server/.env` with your email password

## Email Provider Settings

### Gmail
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

### Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom Domain (cPanel/WHM)
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
```

## Testing Email Configuration

The server will automatically verify email configuration on startup. Look for:
-  `Email server is ready to send messages` - Configuration is correct
- ❌ `Email configuration error` - Check your credentials

## Security Notes

- Never commit `.env` file to version control
- Use strong, unique passwords for email accounts
- Consider using environment-specific email accounts (dev vs production)
- For production, use a dedicated email service (SendGrid, Mailgun, AWS SES)


