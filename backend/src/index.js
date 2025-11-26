import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Config
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialmedai_db';
const CORS_ORIGIN =process.env.CORS_ORIGINS  
// Support multiple allowed origins via comma-separated env `CORS_ORIGINS`
const CORS_ORIGINS = (process.env.CORS_ORIGINS || CORS_ORIGIN)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser or same-origin requests with no Origin header
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
// static uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Connect DB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Socket.IO
import { Server as IOServer } from 'socket.io';
const io = new IOServer(server, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});
app.set('io', io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id || payload._id;
    next();
  } catch (e) {
    next(e);
  }
});

function dmRoom(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
}

io.on('connection', (socket) => {
  socket.on('join', (otherId) => {
    if (!otherId) return;
    socket.join(dmRoom(socket.userId, otherId));
  });
  socket.on('typing', ({ otherId, typing }) => {
    if (!otherId) return;
    socket.to(dmRoom(socket.userId, otherId)).emit('typing', { from: socket.userId, typing: !!typing });
  });
});

// Start
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
