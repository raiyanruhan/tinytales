import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, generateOTP } from '../utils/email.js';
import { saveUser, getUserByEmail, updateUserVerification, getUserById } from '../utils/users.js';

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
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

    // Create or update user
    const user = {
      id: existingUser?.id || Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      verified: false,
      otp: otp,
      otpExpiry: otpExpiry.toISOString(),
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
router.post('/verify-email', async (req, res) => {
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend Verification Code
router.post('/resend-code', async (req, res) => {
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
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
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
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;


