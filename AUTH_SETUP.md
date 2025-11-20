# Authentication System Setup Guide

## Overview

This project now includes a complete password-protected login system with email verification using one-time passwords (OTP).

## Features

- User signup with email and password
- Email verification via OTP (6-digit code)
- User signin with email and password
- JWT-based authentication
- Protected routes
- Session persistence (localStorage)

## Setup Steps

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SMTP_HOST=mail.heemsbd.com
   SMTP_PORT=465
   SMTP_USER=tinytales@heemsbd.com
   SMTP_PASS=your-email-password-here
   NODE_ENV=development
   PORT=3001
   ```

   **CRITICAL**: Replace `SMTP_PASS` with the actual password for the email account `tinytales@heemsbd.com`.

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3001`

### 2. Frontend Setup

1. The frontend is already configured. If you need to set a custom API URL, create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Usage

### Sign Up Flow

1. User visits `/signup`
2. Enters email and password
3. Receives a 6-digit OTP via email
4. Enters OTP on `/verify-email` page
5. Account is verified and user is logged in

### Sign In Flow

1. User visits `/login`
2. Enters email and password
3. If email is not verified, redirected to verification page
4. If verified, user is logged in

### Logout

- Click "Logout" button in the header
- Session is cleared from localStorage

## Email Configuration

The system uses nodemailer with the following SMTP settings:
- **Host**: mail.heemsbd.com
- **Port**: 465 (SSL)
- **Username**: tinytales@heemsbd.com
- **Password**: (Set in `.env` file)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- OTP codes expire after 10 minutes
- Email verification required before login
- CORS protection enabled

## File Structure

```
server/
  ├── routes/
  │   └── auth.js          # Authentication routes
  ├── utils/
  │   ├── email.js         # Email sending utilities
  │   └── users.js         # User data management
  ├── data/
  │   └── users.json       # User storage (auto-created)
  ├── server.js            # Main server file
  └── package.json

src/
  ├── context/
  │   └── AuthContext.tsx  # Authentication state management
  ├── pages/
  │   ├── Login.tsx        # Login page
  │   ├── Signup.tsx       # Signup page
  │   └── EmailVerification.tsx  # OTP verification page
  └── components/
      └── Header.tsx       # Updated with auth buttons
```

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env` file
- Verify email account password is correct
- Check server logs for error messages

### OTP not working
- OTP expires after 10 minutes
- Use "Resend Code" button if needed
- Check spam folder for verification email

### Token expired
- User needs to sign in again
- Tokens expire after 7 days

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong, random string
2. Update `SMTP_PASS` with production email password
3. Set `NODE_ENV=production`
4. Update CORS origin in `server.js` to your production URL
5. Consider using a proper database instead of JSON file storage












