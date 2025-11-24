import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { upload, imageFileFilter, saveAvatar, saveCover } from '../utils/upload.js';

const router = Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT secret not set');
  return jwt.sign({ id: user._id.toString(), v: user.tokenVersion || 0 }, secret, { expiresIn: '7d' });
}

// GET /api/profile/me
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    '_id username displayName bio website location pronouns avatarUrl coverUrl email emailVerified followersCount followingCount postsCount isPrivate notifications'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

// GET /api/profile/username-available?u=username
router.get('/username-available', auth, async (req, res) => {
  const u = (req.query.u || '').trim();
  if (!usernameRegex.test(u)) return res.json({ available: false, reason: 'invalid' });
  const exists = await User.findOne({ username: u, _id: { $ne: req.user.id } }).lean();
  res.json({ available: !exists });
});

// PATCH /api/profile
router.patch(
  '/',
  auth,
  [
    body('displayName').optional().isString().trim().isLength({ max: 60 }),
    body('username')
      .optional()
      .custom((v) => usernameRegex.test(v))
      .withMessage('Username must be 3-30 chars, alphanumeric or underscore'),
    body('bio').optional().isString().trim().isLength({ max: 150 }).withMessage('Bio must be <= 150 characters'),
    body('location').optional().isString().trim().isLength({ max: 60 }),
    body('website')
      .optional()
      .custom((v) => (v === '' ? true : validator.isURL(v, { require_protocol: true })))
      .withMessage('Website must start with http or https'),
    body('pronouns').optional().isString().trim().isLength({ max: 30 }),
    body('isPrivate').optional().isBoolean(),
    body('notifications').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const updates = {};
    const allowed = ['displayName', 'username', 'bio', 'website', 'location', 'pronouns', 'isPrivate', 'notifications'];
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

    // ensure unique username
    if (updates.username) {
      const exists = await User.findOne({ username: updates.username, _id: { $ne: req.user.id } }).select('_id');
      if (exists) return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select(
      '_id username displayName bio website location pronouns avatarUrl coverUrl email emailVerified followersCount followingCount postsCount isPrivate notifications'
    );
    res.json({ message: 'Profile updated', user });
  }
);

// POST /api/profile/avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    imageFileFilter(null, req.file, (err) => {
      if (err) throw err;
    });
    const url = await saveAvatar(req.file.buffer);
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl: url }, { new: true }).select('avatarUrl');
    res.json({ message: 'Avatar updated', avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid file' });
  }
});

router.post('/avatar/remove', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { avatarUrl: null });
  res.json({ message: 'Avatar removed' });
});

// POST /api/profile/cover
router.post('/cover', auth, upload.single('cover'), async (req, res) => {
  try {
    imageFileFilter(null, req.file, (err) => {
      if (err) throw err;
    });
    const url = await saveCover(req.file.buffer);
    const user = await User.findByIdAndUpdate(req.user.id, { coverUrl: url }, { new: true }).select('coverUrl');
    res.json({ message: 'Cover updated', coverUrl: user.coverUrl });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid file' });
  }
});

router.post('/cover/remove', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { coverUrl: null });
  res.json({ message: 'Cover removed' });
});

// POST /api/profile/change-password
router.post(
  '/change-password',
  auth,
  [
    body('currentPassword').isString().notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('confirmPassword').custom((v, { req }) => v === req.body.newPassword).withMessage('Passwords do not match'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid current password' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // logout other devices
    await user.save();

    const token = signToken(user);
    res.json({ message: 'Password updated. Signed out from other devices.', token });
  }
);

export default router;
