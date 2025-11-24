import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized: missing token' });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT secret not set');
    const payload = jwt.verify(token, secret);
    if (!payload?.id) throw new Error('Invalid payload');
    // Ensure tokenVersion matches for session invalidation
    User.findById(payload.id)
      .select('_id tokenVersion')
      .then((user) => {
        if (!user) return res.status(401).json({ message: 'Unauthorized: invalid token' });
        if (typeof payload.v !== 'number' || payload.v !== user.tokenVersion)
          return res.status(401).json({ message: 'Unauthorized: invalid token' });
        req.user = { id: user._id.toString() };
        next();
      })
      .catch(() => res.status(401).json({ message: 'Unauthorized: invalid token' }));
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
}
