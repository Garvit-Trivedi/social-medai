# Backend (JWT Auth)

Node.js + Express + MongoDB backend for login/signup using JWT.

## Features
- POST `/api/auth/signup` — username, email, password, confirmPassword
- POST `/api/auth/login` — email, password
- GET `/api/auth/me` — protected, requires `Authorization: Bearer <token>`
- Clear errors: "Email already exists", "Username already exists", "Passwords do not match", "Invalid credentials"

## Setup
1. Install dependencies
```bash
npm install
```

2. Create `.env`
```bash
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET (long random), CORS_ORIGIN (frontend URL)
```

3. Run MongoDB locally (or point MONGO_URI to Atlas)

4. Start dev server
```bash
npm run dev
# Server: http://localhost:5000
```

## Test with curl
```bash
# Signup
curl -sS -X POST http://localhost:5000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123","confirmPassword":"secret123"}'

# Login
curl -sS -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"secret123"}'

# Me (replace TOKEN)
curl -sS http://localhost:5000/api/auth/me -H "Authorization: Bearer TOKEN"
```
