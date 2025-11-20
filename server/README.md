# TinyTales Backend Server

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `server` directory with the following:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SMTP_HOST=mail.tinytalesearth.com
   SMTP_PORT=465
   SMTP_USER=no-reply@tinytalesearth.com
   SMTP_PASS=your-email-password-here
   NODE_ENV=development
   PORT=3001
   ```

   **Important**: Replace `SMTP_PASS` with the actual email account password.
   
   **Quick Setup**: Run `node setup-env.js` in the server directory to auto-create the `.env` file.

3. **Start the Server**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new account
  - Body: `{ email: string, password: string }`
  - Returns: `{ message: string, userId: string }`

- `POST /api/auth/signin` - Sign in to account
  - Body: `{ email: string, password: string }`
  - Returns: `{ token: string, user: object }`

- `POST /api/auth/verify-email` - Verify email with OTP
  - Body: `{ userId: string, otp: string }`
  - Returns: `{ token: string, user: object }`

- `POST /api/auth/resend-code` - Resend verification code
  - Body: `{ userId: string }`
  - Returns: `{ message: string }`

- `GET /api/auth/verify-token` - Verify JWT token
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ valid: boolean, user: object }`

## Data Storage

User data is stored in `server/data/users.json`. This file is automatically created on first run.












