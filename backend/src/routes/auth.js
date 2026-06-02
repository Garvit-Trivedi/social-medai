import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret not set');
  // include tokenVersion for session invalidation on password change
  return jwt.sign({ id: user._id.toString(), v: user.tokenVersion || 0 }, secret, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 chars'),
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('confirmPassword').exists().withMessage('Confirm password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(409).json({ message: 'Email already exists' });

      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(409).json({ message: 'Username already exists' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({ username, email: email.toLowerCase(), passwordHash });

      const token = signToken(user);
      return res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = signToken(user);
      return res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/social-sync (for Supabase OAuth - SECURE)
router.post(
  '/social-sync',
  [
    body('accessToken').exists().withMessage('Access token is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { accessToken } = req.body;

    try {
      // VERIFY user with Supabase Admin
      const { data: { user: sbUser }, error } = await supabaseAdmin.auth.getUser(accessToken);
      
      if (error || !sbUser) {
        return res.status(401).json({ message: 'Invalid Supabase session' });
      }

      const email = sbUser.email;
      const username = sbUser.user_metadata?.full_name || sbUser.user_metadata?.user_name || email.split('@')[0];

      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Create new user if they don't exist
        const safeUsername = username.replace(/\s+/g, '_').toLowerCase() + Math.floor(Math.random() * 1000);
        user = await User.create({
          username: safeUsername.substring(0, 30),
          email: email.toLowerCase(),
          passwordHash: 'OAUTH_VERIFIED_' + Math.random().toString(36), // Secure placeholder
        });
      }

      const token = signToken(user);
      return res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Social sync error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/me (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id username email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
