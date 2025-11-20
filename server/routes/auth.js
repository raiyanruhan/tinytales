import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, generateOTP, sendPasswordResetEmail } from '../utils/email.js';
import { 
  saveUser, 
  getUserByEmail, 
  getUserById,
  resetFailedLoginAttempts,
  incrementFailedLoginAttempts,
  isAccountLocked,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
  setPasswordResetToken,
  getUserByPasswordResetToken,
  clearPasswordResetToken,
  updateUserRole
} from '../utils/users.js';
import { verifyCSRF } from '../middleware/security.js';
import { ROLES } from '../middleware/rbac.js';

const router = express.Router();

// Helper function to generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role || ROLES.USER },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Access token expires in 15 minutes
  );

  const refreshToken = jwt.sign(
    { userId: user.id, tokenVersion: Date.now() },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' } // Refresh token expires in 30 days
  );

  return { accessToken, refreshToken };
}

// Sign Up
router.post('/signup', verifyCSRF, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser && existingUser.verified) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Set default role to 'user' (admin role can be assigned manually)
    const defaultRole = email.toLowerCase() === 'raiyanbinrashid0@gmail.com' ? ROLES.ADMIN : ROLES.USER;

    // Create or update user
    const user = {
      id: existingUser?.id || Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      verified: false,
      role: defaultRole,
      otp: otp,
      otpExpiry: otpExpiry.toISOString(),
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveUser(user);

    // Send verification email
    try {
      await sendVerificationEmail(email, otp);
      res.json({ 
        message: 'Verification code sent to your email',
        userId: user.id 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', verifyCSRF, async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check expiry
    const otpExpiry = new Date(user.otpExpiry);
    if (otpExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
    }

    // Verify user
    user.verified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.updatedAt = new Date().toISOString();
    saveUser(user);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    saveRefreshToken(user.id, refreshToken);

    res.json({ 
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role || ROLES.USER
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend Verification Code
router.post('/resend-code', verifyCSRF, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry.toISOString();
    user.updatedAt = new Date().toISOString();
    saveUser(user);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, otp);
      res.json({ message: 'Verification code resent to your email' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign In
router.post('/signin', verifyCSRF, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      const lockedUntil = new Date(user.lockedUntil);
      const minutesRemaining = Math.ceil((lockedUntil - new Date()) / (1000 * 60));
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to too many failed login attempts',
        lockedUntil: user.lockedUntil,
        minutesRemaining
      });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(403).json({ 
        error: 'Please verify your email first',
        userId: user.id,
        needsVerification: true
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Increment failed login attempts
      incrementFailedLoginAttempts(user.id);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Successful login - reset failed attempts
    resetFailedLoginAttempts(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    saveRefreshToken(user.id, refreshToken);

    res.json({
      message: 'Sign in successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role || ROLES.USER
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token
router.post('/refresh-token', verifyCSRF, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Get user
    const user = getUserById(decoded.userId);
    if (!user || !user.verified) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Verify stored refresh token matches
    const storedRefreshToken = getRefreshToken(user.id);
    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    saveRefreshToken(user.id, newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role || ROLES.USER
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', verifyCSRF, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = getUserByEmail(email.toLowerCase());
    
    // Don't reveal if user exists for security
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    setPasswordResetToken(user.id, resetToken, resetExpiry.toISOString());

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ error: 'Failed to send password reset email. Please try again.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', verifyCSRF, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user by reset token
    const user = getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    clearPasswordResetToken(user.id);
    user.updatedAt = new Date().toISOString();
    saveUser(user);

    // Clear refresh token for security (force re-login)
    clearRefreshToken(user.id);

    res.json({ 
      message: 'Password reset successfully. Please sign in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (clear refresh token)
router.post('/logout', verifyCSRF, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        clearRefreshToken(decoded.userId);
      } catch (error) {
        // Token might be expired, ignore
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Token (for protected routes)
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = getUserById(decoded.userId);

    if (!user || !user.verified) {
      return res.status(401).json({ error: 'Invalid or unverified user' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified,
        role: user.role || ROLES.USER
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
