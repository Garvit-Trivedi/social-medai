import { Router } from 'express';
import { query } from 'express-validator';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Block from '../models/Block.js';

const router = Router();

// GET /api/users/all - list a limited set of users
router.get('/all', auth, async (req, res) => {
  const users = await User.find({})
    .select('_id username avatarUrl displayName')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ users });
});

// POST /api/users/:id/follow
router.post('/:id/follow', auth, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
  const target = await User.findById(req.params.id).select('_id');
  if (!target) return res.status(404).json({ message: 'User not found' });
  try {
    await Follow.updateOne({ follower: req.user.id, following: target._id }, {}, { upsert: true, setDefaultsOnInsert: true });
    await User.updateOne({ _id: req.user.id }, { $inc: { followingCount: 1 } });
    await User.updateOne({ _id: target._id }, { $inc: { followersCount: 1 } });
    res.json({ message: 'Followed' });
  } catch (e) {
    res.status(400).json({ message: 'Already following?' });
  }
});

// DELETE /api/users/:id/follow
router.delete('/:id/follow', auth, async (req, res) => {
  const target = await User.findById(req.params.id).select('_id');
  if (!target) return res.status(404).json({ message: 'User not found' });
  const out = await Follow.deleteOne({ follower: req.user.id, following: target._id });
  if (out.deletedCount > 0) {
    await User.updateOne({ _id: req.user.id }, { $inc: { followingCount: -1 } });
    await User.updateOne({ _id: target._id }, { $inc: { followersCount: -1 } });
  }
  res.json({ message: 'Unfollowed' });
});

// GET /api/users/:id/followers
router.get('/:id/followers', auth, async (req, res) => {
  const followers = await Follow.find({ following: req.params.id }).populate('follower', 'username avatarUrl').lean();
  res.json({ followers: followers.map(f => ({ _id: f.follower._id, username: f.follower.username, avatarUrl: f.follower.avatarUrl })) });
});

// GET /api/users/:id/following
router.get('/:id/following', auth, async (req, res) => {
  const following = await Follow.find({ follower: req.params.id }).populate('following', 'username avatarUrl').lean();
  res.json({ following: following.map(f => ({ _id: f.following._id, username: f.following.username, avatarUrl: f.following.avatarUrl })) });
});

// GET /api/users/search?u=term (by username prefix)
router.get('/search', auth, async (req, res) => {
  const term = (req.query.u || '').trim();
  if (!term) return res.json({ users: [] });
  const users = await User.find({ username: { $regex: '^' + term, $options: 'i' } })
    .select('_id username avatarUrl displayName')
    .limit(20)
    .lean();
  res.json({ users });
});

// GET /api/users/by-username/:username - public profile
router.get('/by-username/:username', auth, async (req, res) => {
  const u = await User.findOne({ username: req.params.username }).select(
    '_id username displayName bio website location pronouns avatarUrl coverUrl followersCount followingCount postsCount isPrivate'
  );
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json({ user: u });
});

export default router;

// GET /api/users/:id/is-following
router.get('/:id/is-following', auth, async (req, res) => {
  const exists = await Follow.exists({ follower: req.user.id, following: req.params.id });
  res.json({ following: !!exists });
});

// POST /api/users/:id/block
router.post('/:id/block', auth, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot block yourself' });
  const target = await User.findById(req.params.id).select('_id');
  if (!target) return res.status(404).json({ message: 'User not found' });
  await Block.updateOne({ blocker: req.user.id, blocked: target._id }, {}, { upsert: true, setDefaultsOnInsert: true });
  res.json({ message: 'Blocked' });
});

// DELETE /api/users/:id/block
router.delete('/:id/block', auth, async (req, res) => {
  const target = await User.findById(req.params.id).select('_id');
  if (!target) return res.status(404).json({ message: 'User not found' });
  await Block.deleteOne({ blocker: req.user.id, blocked: target._id });
  res.json({ message: 'Unblocked' });
});

// GET /api/users/blocks - list blocked users
router.get('/blocks/list', auth, async (req, res) => {
  const list = await Block.find({ blocker: req.user.id }).populate('blocked', 'username avatarUrl displayName').lean();
  res.json({
    blocked: list.map((b) => ({ _id: b.blocked._id, username: b.blocked.username, avatarUrl: b.blocked.avatarUrl, displayName: b.blocked.displayName })),
  });
});
