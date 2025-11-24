# React + Vite
 
# Pulse — Social Media Web App

This repository contains a full‑stack social media prototype with a React + Vite frontend and a Node.js/Express + MongoDB backend. Users can sign up, log in, create image/video posts, like/save, follow/unfollow, manage profiles (avatar/cover), search users, exchange DMs with mutual followers, and manage privacy/blocks.


## Tech Stack

- **Frontend**: React 18, Vite, React Router, Framer Motion, Tailwind-like utility classes (plain CSS), Socket.IO client
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.IO, Multer, Sharp, JWT auth, express-validator, CORS


## Project Structure

Monorepo with separate `frontend/` and `backend/` apps.

- `frontend/src/App.jsx` defines routes
- `frontend/src/pages/` holds page screens
- `backend/src/index.js` bootstraps server, REST routes, Socket.IO


## Environment & Setup

1) Backend env vars (create `backend/.env`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/socialmedai_db
JWT_SECRET=your_strong_secret
CORS_ORIGIN=http://localhost:5173
```

2) Install deps:

```
# in backend/
npm install

# in frontend/
npm install
```

3) Run locally:

```
# backend (http://localhost:5000)
npm run dev

# frontend (http://localhost:5173)
npm run dev
```

The frontend expects the backend at `http://localhost:5000` and uses a simple token‑based auth via `localStorage`.


## Frontend: Routes and Pages

Routes are declared in `frontend/src/App.jsx` using `react-router-dom`.

- **`/` → `Landing.jsx`**
  Marketing/landing page for the app with product highlight sections, a demo video block, CTAs, FAQ, and footer. Top-right buttons link to `Login` and `Signup`.

- **`/login` → `Login.jsx`**
  Email/password login form wrapped in `AuthWrapper.jsx` for animated transitions. On success, stores JWT in `localStorage` and routes to `/dashboard`.

- **`/signup` → `Signup.jsx`**
  Registration form (username, email, password, confirm). On success, stores JWT and routes to `/dashboard`.

- All routes below are protected by `ProtectedRoute.jsx` (redirects to `/login` if no token). `MobileFooter.jsx` is rendered globally on protected screens.

- **`/dashboard` → `Dashboard.jsx`**
  Main feed screen.
  - Calls `GET /api/auth/me` and `GET /api/posts/feed`.
  - Displays posts via `PostCard.jsx` with like, save, comment hooks.
  - `Topbar.jsx` has actions: compose, profile, logout. `Sidebar.jsx` shows nav and unread messages count.
  - Polls `GET /api/messages/unread-total` every 10s.

- **`/dashboard/search` → `SearchUsers.jsx`**
  Debounced username search using `GET /api/users/search?u=`. Links to public profiles at `/u/:username`.

- **`/dashboard/profile` → `Profile.jsx`**
  Your own profile page.
  - Loads `GET /api/profile/me` and `GET /api/posts/me`.
  - Upload/remove avatar and cover: `POST /api/profile/avatar`, `POST /api/profile/avatar/remove`, `POST /api/profile/cover`, `POST /api/profile/cover/remove`.
  - Followers/Following modals via `GET /api/users/:id/followers` and `GET /api/users/:id/following`. Unfollow support.
  - Change password modal hits `POST /api/profile/change-password` and rotates JWT (server increments `tokenVersion`).

- **`/dashboard/profile/edit` → `EditProfile.jsx`**
  Edit display name, username, bio (≤150), website (validated URL), location, pronouns, privacy, notifications. Live username availability check via `GET /api/profile/username-available?u=`; submit via `PATCH /api/profile`.

- **`/dashboard/compose` → `PostComposer.jsx`**
  Create a post with either up to 4 images or a single video (≤ 60 sec, ≤ 8MB per file). Client performs media validation and, for video, reads duration before uploading. Submits `FormData` to `POST /api/posts` with optional `durationSeconds` for videos.

- **`/dashboard/saved` → `Saved.jsx`**
  Shows saved posts from `GET /api/posts/saved/list`. Simple “Collections” CRUD view backed by `POST /api/posts/collections` and `GET /api/posts/collections` (adding/removing posts to a collection supported by additional routes).

- **`/dashboard/messages` → `Messages.jsx`**
  Mutual-follow DMs.
  - Lists mutuals from `GET /api/messages/mutuals` (excludes blocked relationships).
  - Chat thread via `GET /api/messages/thread/:id` (marks inbound messages as read). Send with `POST /api/messages/thread/:id`.
  - Real-time typing indicator using Socket.IO; joins a per-dm room when a user is selected.

- **`/dashboard/settings` → `Settings.jsx`**
  - Theme toggle (persisted in `localStorage`).
  - Block/unblock users: search (`GET /api/users/search`) then `POST /api/users/:id/block` / `DELETE /api/users/:id/block`. Shows current blocked list via `GET /api/users/blocks/list`.
  - Manage posts: display personal posts and delete via `DELETE /api/posts/:id`.

- **`/u/:username` → `PublicProfile.jsx`**
  Public profile view for any user. Loads `GET /api/users/by-username/:username`, checks follow state via `GET /api/users/:id/is-following`, allows follow/unfollow. Displays that user’s public/own posts filtered from feed.


## Global Components

- **`ProtectedRoute.jsx`**: Redirects to `/login` if no token; renders `MobileFooter.jsx` on mobile.
- **Layout**: `Topbar.jsx`, `Sidebar.jsx`, `MobileFooter.jsx` are used across the dashboard pages.
- **Feed**: `PostCard.jsx` renders posts with like/save/comment hooks wired to backend endpoints.
- **Auth animations**: `AuthWrapper.jsx` and route-level `AnimatePresence` in `App.jsx` handle smooth login/signup transitions.


## Backend Overview (API)

Base URL: `http://localhost:5000`

- Auth (`backend/src/routes/auth.js`)
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET  /api/auth/me`

- Profile (`backend/src/routes/profile.js`)
  - `GET  /api/profile/me`
  - `GET  /api/profile/username-available?u=`
  - `PATCH /api/profile`
  - `POST /api/profile/avatar` • `POST /api/profile/avatar/remove`
  - `POST /api/profile/cover`  • `POST /api/profile/cover/remove`
  - `POST /api/profile/change-password` (rotates `tokenVersion` and returns a fresh token)

- Users (`backend/src/routes/users.js`)
  - Follow: `POST /api/users/:id/follow`, `DELETE /api/users/:id/follow`
  - Lists: `GET /api/users/:id/followers`, `GET /api/users/:id/following`
  - Search: `GET /api/users/search?u=`
  - Public profile: `GET /api/users/by-username/:username`
  - Is following: `GET /api/users/:id/is-following`
  - Block: `POST /api/users/:id/block`, `DELETE /api/users/:id/block`, `GET /api/users/blocks/list`

- Posts (`backend/src/routes/posts.js`)
  - Create: `POST /api/posts` (images or single video ≤60s)
  - Read: `GET /api/posts/feed`, `GET /api/posts/me`, `GET /api/posts/saved/list`
  - Update: `PATCH /api/posts/:id`, `POST /api/posts/:id/archive`
  - Delete: `DELETE /api/posts/:id`
  - Interact: `POST /api/posts/:id/like`, `POST /api/posts/:id/save`
  - Collections: `POST /api/posts/collections`, `GET /api/posts/collections`, `POST /api/posts/collections/:cid/posts`, `DELETE /api/posts/collections/:cid/posts/:pid`
  - Comments: `POST /api/posts/:id/comments`, `GET /api/posts/:id/comments`

- Messages (`backend/src/routes/messages.js`)
  - Mutuals: `GET /api/messages/mutuals`
  - Thread: `GET /api/messages/thread/:id`, `POST /api/messages/thread/:id`
  - Unread total: `GET /api/messages/unread-total`

All protected endpoints require `Authorization: Bearer <token>` header. Tokens are JWTs signed with `JWT_SECRET`. Server enforces session invalidation using `tokenVersion`.


## Data Models (Mongoose)

- **User** (`User.js`): profile, stats, preferences, saved posts, collections, tokenVersion.
- **Post** (`Post.js`): author, captions, images[] or video, counts, visibility, status.
- **Comment** (`Comment.js`): post, author, text, parent.
- **Follow** (`Follow.js`): follower/following pairs, unique index.
- **Block** (`Block.js`): blocker/blocked pairs, unique index.
- **Message** (`Message.js`): from, to, text/media, readAt.


## Real‑time Messaging

Socket.IO is initialized in `backend/src/index.js`. Clients authenticate with the same JWT. A deterministic DM room key is derived from user IDs. Events:

- `join` → subscribe to a DM room for the selected user
- `typing` → broadcast typing status to the other participant


## Media Uploads

Uploads use Multer in memory storage; files are written/processed to `backend/uploads/` and served at `/uploads`.

- Images: validated (`jpeg/png/webp`) and resized with Sharp. Saved as WebP.
- Video: validated (`mp4/webm/ogg`) and saved as-is (no transcoding) for prototype.
- Limits: max file size 8MB. Video duration must be ≤ 60 seconds (validated client + server).


## Authentication Flow

- `Signup/Login` return a JWT. Frontend stores it in `localStorage` as `token`.
- `ProtectedRoute.jsx` checks token and redirects to `/login` if missing.
- `Change Password` increments `tokenVersion`, invalidating old tokens on server; a fresh token is returned.


## Development Notes

- API base URL and request helper live in `frontend/src/lib/api` (used across pages like `Dashboard.jsx`, `Profile.jsx`, `PostComposer.jsx`, etc.).
- The feed maps backend post structures to the UI card model and resolves relative `/uploads/...` URLs using `API_URL` from the same helper.
- `AnimatePresence` is applied only for auth routes in `App.jsx` to create a smooth login/signup experience.


## Future Improvements

- Persisted sockets and message receipts/typing per-thread memory
- Pagination and infinite scroll on feed and lists
- Notifications service (likes/comments/follows) and toasts
- Role-based rate limiting and better error UX
- Post editing with media replacement and server-side transcoding

