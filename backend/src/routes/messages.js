import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import Block from '../models/Block.js';

const router = Router();

async function areMutual(aId, bId) {
  const [ab, ba] = await Promise.all([
    Follow.exists({ follower: aId, following: bId }),
    Follow.exists({ follower: bId, following: aId }),
  ]);
  if (!ab || !ba) return false;
  const blocked = await Block.exists({ $or: [ { blocker: aId, blocked: bId }, { blocker: bId, blocked: aId } ] });
  return !blocked;
}

// GET /api/messages/mutuals - users you follow and they follow you back
router.get('/mutuals', auth, async (req, res) => {
  const following = await Follow.find({ follower: req.user.id }).select('following').lean();
  const followingIds = following.map((f) => f.following);
  const followers = await Follow.find({ following: req.user.id, follower: { $in: followingIds } })
    .populate('follower', 'username avatarUrl displayName')
    .lean();
  // filter out blocked users
  const blocks = await Block.find({ $or: [ { blocker: req.user.id }, { blocked: req.user.id } ] }).lean();
  const blockedSet = new Set();
  blocks.forEach(b => { blockedSet.add(String(b.blocker)); blockedSet.add(String(b.blocked)); });
  const users = followers
    .map((f) => ({ _id: f.follower._id, username: f.follower.username, avatarUrl: f.follower.avatarUrl, displayName: f.follower.displayName }))
    .filter(u => !blockedSet.has(String(u._id)));
  // per-user unread counts
  const unread = await Message.aggregate([
    { $match: { to: mongoose.Types.ObjectId.createFromHexString(String(req.user.id)), readAt: { $exists: false } } },
    { $group: { _id: '$from', count: { $sum: 1 } } },
  ]);
  const unreadMap = Object.fromEntries(unread.map((u) => [String(u._id), u.count]));
  const usersWithCounts = users.map((u) => ({ ...u, unread: unreadMap[String(u._id)] || 0 }));
  res.json({ users: usersWithCounts });
});

// GET /api/messages/thread/:id?after=<ISO>&limit=50 - fetch messages with user
router.get('/thread/:id', auth, async (req, res) => {
  const otherId = req.params.id;
  const ok = await areMutual(req.user.id, otherId);
  if (!ok) return res.status(403).json({ message: 'Messaging allowed only for mutual followers' });
  const after = req.query.after ? new Date(req.query.after) : null;
  const q = {
    $or: [
      { from: req.user.id, to: otherId },
      { from: otherId, to: req.user.id },
    ],
  };
  if (after) q.createdAt = { $gt: after };
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const messages = await Message.find(q).sort({ createdAt: 1 }).limit(limit).lean();
  // mark messages to me from other user as read
  await Message.updateMany({ from: otherId, to: req.user.id, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  res.json({ messages });
});

// POST /api/messages/thread/:id { text }
router.post('/thread/:id', auth, async (req, res) => {
  const otherId = req.params.id;
  const ok = await areMutual(req.user.id, otherId);
  if (!ok) return res.status(403).json({ message: 'Messaging allowed only for mutual followers' });
  const text = (req.body?.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Message text required' });
  const msg = await Message.create({ from: req.user.id, to: otherId, text });
  res.status(201).json({ message: 'Sent', data: { _id: msg._id, from: msg.from, to: msg.to, text: msg.text, createdAt: msg.createdAt } });
});

export default router;

// GET /api/messages/unread-total - total unread messages count for current user
router.get('/unread-total', auth, async (req, res) => {
  const count = await Message.countDocuments({ to: req.user.id, readAt: { $exists: false } });
  res.json({ count });
});
