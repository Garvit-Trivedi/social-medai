# Pulse — Social Media Web App

A full‑stack social media prototype with a modern React + Vite frontend and a Node.js/Express + MongoDB backend. Users can sign up, log in, create image/video posts, like/save, follow/unfollow, manage profiles (avatar/cover), search users, exchange DMs with mutual followers, and manage privacy/blocks.

> Monorepo layout with `frontend/` and `backend/` apps.

---

## ✨ Features
- **Auth**: JWT login/signup, session invalidation via `tokenVersion`.
- **Posts**: Images (Sharp processing) or single short video, like, save, comments.
- **Profiles**: Avatar & cover upload/remove, edit profile, change password.
- **Social Graph**: Follow/unfollow, followers/following lists, blocks.
- **Search**: Debounced username search.
- **Messaging**: Mutual-follow DMs with Socket.IO typing indicators.
- **Responsive UI**: React Router navigation, animated auth transitions.

---

## 🧰 Tech Stack
- **Frontend**: React 18/19, Vite, React Router, Framer Motion, Tailwind (v4), Socket.IO client
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.IO, Multer, Sharp, JWT, express-validator, CORS

---
## High-Level Architecture
```
React (Vite)
 ├── Protected Routes
 ├── REST API calls (JWT)
 ├── WebSockets (DMs, typing)
 │
Node.js / Express
 ├── Auth & Privacy Rules
 ├── Media Processing
 ├── REST APIs
 │
MongoDB
 ├── Users
 ├── Posts
 ├── Messages
 └── Social Graph
`
```
## 📂 Project Structure
```
.
├── backend/           # API, sockets, uploads, Mongo models
│   └── src/
│       ├── index.js   # Express + Socket.IO bootstrap
│       ├── models/    # Mongoose models (User, Post, Comment, Follow, Block, Message)
│       └── routes/    # REST routes (auth, profile, users, posts, messages)
├── frontend/          # React app (Vite)
│   └── src/
│       ├── App.jsx    # Routes
│       ├── components/
│       └── pages/
└── README.md          # You are here
```

---

## ⚙️ Environment Variables
Create `.env` files before running. Examples:

Backend `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/socialmedai_db
JWT_SECRET=your_strong_secret
CORS_ORIGIN=http://localhost:5173
```

Frontend `frontend/.env` (if needed):
```
# Example
VITE_API_URL=http://localhost:5000
```

> Note: `.env` files are ignored by Git via the root `.gitignore`.

---

## 🚀 Getting Started
1) Install dependencies
```
# In backend/
npm install

# In frontend/
npm install
```

2) Start development servers
```
# backend (http://localhost:5000)
npm run dev

# frontend (http://localhost:5173)
npm run dev
```

3) Login/Signup from the frontend. The app stores the JWT in `localStorage` and uses it for protected routes.

---

## 🧪 Key API Endpoints (Backend)
Base URL: `http://localhost:5000`

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- Profile: `GET /api/profile/me`, `PATCH /api/profile`, avatar/cover upload/remove, change password
- Users: follow/unfollow, search, public profile by username, is-following, block/unblock
- Posts: CRUD, like/save, collections, comments
- Messages: mutuals, thread CRUD, unread total

> See details in `frontend/README.md` and route files under `backend/src/routes/`.

---

## 🖼️ Media Handling
- Multer in-memory upload → processed to `backend/uploads/` (ignored by Git).
- Images validated and resized to WebP via Sharp.
- Video validated and saved as-is (prototype), max 60s, 8MB per file.

---

## 📦 Scripts
Backend (`backend/package.json`):
- `npm run dev` — nodemon server
- `npm start` — node server

Frontend (`frontend/package.json`):
- `npm run dev` — Vite dev
- `npm run build` — Vite build
- `npm run preview` — Vite preview

---

## 🛡️ Security & Privacy
- Store secrets in `.env` only.
- JWT via `Authorization: Bearer <token>` header.
- CORS locked to frontend origin via `CORS_ORIGIN`.

---


## 🤝 Contributing
- Fork the repo and create a feature branch.
- Keep commits focused and include helpful messages.
- Open a PR with screenshots and a clear description.

---


