import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { upload, imageFileFilter, videoFileFilter, saveImage, saveVideo } from '../utils/upload.js';
import Comment from '../models/Comment.js';

const router = Router();

// DELETE /api/posts/:id - delete own post
router.delete('/:id', auth, async (req, res) => {
  const p = await Post.findById(req.params.id).select('_id author');
  if (!p) return res.status(404).json({ message: 'Post not found' });
  if (String(p.author) !== String(req.user.id)) return res.status(403).json({ message: 'Not allowed' });
  await Post.deleteOne({ _id: p._id });
  await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: -1 } });
  res.json({ message: 'Deleted' });
});

// Helpers
function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

// GET /api/posts/me - list own posts (active)
router.get('/me', auth, async (req, res) => {
  const posts = await Post.find({ author: req.user.id, status: { $ne: 'archived' } })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ posts });
});

// GET /api/posts/feed - simple global feed newest first (public + own)
router.get('/feed', auth, async (req, res) => {
  const posts = await Post.find({ $or: [{ visibility: 'public' }, { author: req.user.id }] , status: { $ne: 'archived' } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('author', 'username avatarUrl')
    .lean();
  res.json({ posts });
});

// POST /api/posts - create (multiple images OR single video)
router.post(
  '/',
  auth,
  upload.array('media', 4),
  [
    body('caption').optional().isString().trim().isLength({ max: 2200 }),
    body('location').optional().isString().trim().isLength({ max: 120 }),
    body('allowComments').optional().isBoolean(),
    body('visibility').optional().isIn(['public', 'followers']),
    body('status').optional().isIn(['active', 'draft']),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;

    const supabaseUrls = req.body.supabaseUrls ? JSON.parse(req.body.supabaseUrls) : null;

    if (!req.files?.length && !supabaseUrls) {
      return res.status(400).json({ message: 'No media uploaded' });
    }

    // Determine if images or video
    let isImage, isVideo;
    if (supabaseUrls && supabaseUrls.length > 0) {
      // For URLs, we infer type from the first file in the files array (if present) 
      // or assume based on extension or just treat as images for now.
      // Frontend sends consistent types.
      const isVideoFile = req.files?.[0]?.mimetype.startsWith('video/') || false;
      isImage = !isVideoFile;
      isVideo = isVideoFile;
    } else {
      const first = req.files[0];
      isImage = first.mimetype.startsWith('image/');
      isVideo = first.mimetype.startsWith('video/');
    }

    if (isImage && !supabaseUrls && req.files.some((f) => f.mimetype.startsWith('video/'))) {
      return res.status(400).json({ message: 'Cannot mix images and video' });
    }

    const payload = {
      author: req.user.id,
      caption: req.body.caption || '',
      location: req.body.location || '',
      allowComments: req.body.allowComments !== undefined ? req.body.allowComments === 'true' || req.body.allowComments === true : true,
      visibility: req.body.visibility || 'public',
      status: req.body.status || 'active',
      images: [],
      video: {},
    };

    try {
      if (supabaseUrls && supabaseUrls.length > 0) {
        if (isImage) {
          supabaseUrls.forEach(url => payload.images.push({ url }));
        } else {
          payload.video = { url: supabaseUrls[0] };
        }
      } else if (isImage) {
        // validate images
        for (const file of req.files) imageFileFilter(null, file, (err) => { if (err) throw err; });
        for (const file of req.files) {
          const url = await saveImage(file.buffer);
          payload.images.push({ url });
        }
      } else if (isVideo) {
        if (req.files.length > 1) return res.status(400).json({ message: 'Only one video allowed' });
        const duration = Number(req.body.durationSeconds);
        if (!Number.isFinite(duration) || duration <= 0 || duration > 60) {
          return res.status(400).json({ message: 'Video must be 60 seconds or less' });
        }
        videoFileFilter(null, req.files[0], (err) => { if (err) throw err; });
        const url = await saveVideo(req.files[0]);
        payload.video = { url };
      } else {
        return res.status(400).json({ message: 'Unsupported media' });
      }

      let post = await Post.create(payload);
      post = await post.populate('author', 'username avatarUrl');
      await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
      res.status(201).json({ message: 'Post created', post });
    } catch (err) {
      res.status(400).json({ message: err.message || 'Upload failed' });
    }
  }
);

// PATCH /api/posts/:id - edit caption/settings (no media replacement here)
router.patch(
  '/:id',
  auth,
  [
    body('caption').optional().isString().trim().isLength({ max: 2200 }),
    body('location').optional().isString().trim().isLength({ max: 120 }),
    body('allowComments').optional().isBoolean(),
    body('visibility').optional().isIn(['public', 'followers']),
    body('status').optional().isIn(['active', 'archived', 'draft']),
  ],
  async (req, res) => {
    if (!validate(req, res)) return;
    const updates = {};
    const allowed = ['caption', 'location', 'allowComments', 'visibility', 'status'];
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    const post = await Post.findOneAndUpdate({ _id: req.params.id, author: req.user.id }, updates, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post updated', post });
  }
);

// DELETE /api/posts/:id - delete (confirm on client)
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: -1 } });
  res.json({ message: 'Post deleted' });
});

// POST /api/posts/:id/archive - archive/unarchive
router.post('/:id/archive', auth, async (req, res) => {
  const { archive } = req.body || {};
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user.id },
    { status: archive ? 'archived' : 'active' },
    { new: true }
  );
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: archive ? 'Post archived' : 'Post unarchived', post });
});

// POST /api/posts/:id/like - toggle like (prototype: count only)
router.post('/:id/like', auth, async (req, res) => {
  const { liked } = req.body || {};
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.likesCount = Math.max(0, (post.likesCount || 0) + (liked ? 1 : -1));
  await post.save();
  res.json({ message: liked ? 'Liked' : 'Unliked', likesCount: post.likesCount });
});

// POST /api/posts/:id/save - toggle save
router.post('/:id/save', auth, async (req, res) => {
  const { saved } = req.body || {};
  const u = await User.findById(req.user.id).select('savedPosts');
  if (!u) return res.status(404).json({ message: 'User not found' });
  const has = u.savedPosts.some((p) => p.toString() === req.params.id);
  if (saved && !has) u.savedPosts.push(req.params.id);
  if (!saved && has) u.savedPosts = u.savedPosts.filter((p) => p.toString() !== req.params.id);
  await u.save();
  res.json({ message: saved ? 'Saved' : 'Unsaved' });
});

// GET /api/posts/saved - list saved posts
router.get('/saved/list', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('savedPosts').lean();
  const posts = await Post.find({ _id: { $in: user.savedPosts } }).sort({ createdAt: -1 }).lean();
  res.json({ posts });
});

// Collections
router.post('/collections', auth, [body('name').isString().trim().isLength({ min: 1, max: 60 })], async (req, res) => {
  if (!validate(req, res)) return;
  const user = await User.findById(req.user.id).select('collections');
  user.collections.push({ name: req.body.name, posts: [] });
  await user.save();
  res.status(201).json({ message: 'Collection created', collections: user.collections });
});

router.get('/collections', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('collections').lean();
  res.json({ collections: user.collections });
});

router.post('/collections/:cid/posts', auth, [body('postId').isString()], async (req, res) => {
  if (!validate(req, res)) return;
  const user = await User.findById(req.user.id).select('collections');
  const col = user.collections.id(req.params.cid);
  if (!col) return res.status(404).json({ message: 'Collection not found' });
  if (!col.posts.some((p) => p.toString() === req.body.postId)) col.posts.push(req.body.postId);
  await user.save();
  res.json({ message: 'Added to collection', collection: col });
});

router.delete('/collections/:cid/posts/:pid', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('collections');
  const col = user.collections.id(req.params.cid);
  if (!col) return res.status(404).json({ message: 'Collection not found' });
  col.posts = col.posts.filter((p) => p.toString() !== req.params.pid);
  await user.save();
  res.json({ message: 'Removed from collection', collection: col });
});

// COMMENTS
// POST /api/posts/:id/comments { text, parentId? }
router.post('/:id/comments', auth, [body('text').isString().trim().isLength({ min: 1, max: 1000 })], async (req, res) => {
  if (!validate(req, res)) return;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const doc = await Comment.create({ post: post._id, author: req.user.id, text: req.body.text, parent: req.body.parentId || null });
  await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
  res.status(201).json({ message: 'Comment added', comment: { _id: doc._id, text: doc.text, parent: doc.parent, author: req.user.id, createdAt: doc.createdAt } });
});

// GET /api/posts/:id/comments - flat list grouped by parent
router.get('/:id/comments', auth, async (req, res) => {
  const post = await Post.findById(req.params.id).select('_id');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).lean();
  res.json({ comments });
});

export default router;
