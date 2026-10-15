# Deeniyat Maktab API

Express API for student rosters, attendance, fee payments, reports, and
expenses. Data is stored in MongoDB through Mongoose.

## Requirements

- Node.js 22.13 or later
- npm
- A MongoDB deployment or local MongoDB server

## Run

Install dependencies, copy `.env.example` to `.env` in the backend root, and
configure the database URI, JWT secret, and initial admin credentials before
starting the API:

```sh
npm install
npm run dev
```

The API listens on `http://localhost:3001` by default. Configure `PORT` to
change it.

## Environment

Configure these values in `.env`:

- `MONGODB_URI`: MongoDB connection URI (required; `MONGO_URI` is also accepted).
- `MONGODB_DB_NAME`: Optional database name to use instead of the one in the URI.
- `PORT`: HTTP port; defaults to `3001`.
- `JWT_SECRET`: unique signing secret of at least 32 characters.
- `BOOTSTRAP_ADMIN_USERNAME` and `BOOTSTRAP_ADMIN_PASSWORD`: required initial
  administrator credentials. The account is created on first startup and its
  password is hashed before storage.
- `BOOTSTRAP_ADMIN_USER_ID`: optional stable ID for the initial admin.

Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Do not commit `.env` or use the example placeholder values in production.

For browser requests, CORS allows `https://yasindev46.github.io`,
`http://localhost:5173`, and any origins configured with `LOCAL_REACT_URL` or
`CLIENT_URL`.

The MongoDB client is shared for the lifetime of the server and uses the Node
driver's default pool settings. `GET /api/health` reports whether the database
connection is ready.

## Data model

- `students`: numeric `id`, `sr`, `name`, `class`, and `mobile`.
- `attendance_records`: `student_id`, ISO date string, and `Present`/`Absent` status.
- `fees_records`: unique `student_id`, `paid_amount`, and optional `notes`.
- `expenses_records`: numeric `id`, `paid_amount`, `purpose`, and ISO date string.
- `users`: unique username, bcrypt-hashed password, user ID, and role (`admin`
  or `nonAdmin`).

The models use the existing MongoDB collection names. The numeric student ID is
kept in API responses so the existing client and imported records continue to
work. Student and expense IDs are allocated atomically and continue from the
largest existing ID in their collection.

## API routes

- `POST /api/auth/loginuser`: public login. Send
  `{"username":"...","password":"..."}` to receive a bearer token.
- `POST /api/auth/registeruser`: public registration. Usernames must be 3–32
  letters, numbers, dots, underscores, or hyphens. Passwords must be at least
  8 characters and no more than 72 UTF-8 bytes. Public registrations receive
  the `nonAdmin` role.
- `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`,
  `POST /api/students/import`
- `POST /api/attendance/mark-all`, `POST /api/attendance/finalize`,
  `POST /api/attendance/:studentId`
- `GET /api/fees`, `PUT /api/fees/:studentId`
- `GET /api/expenses`, `POST /api/expenses`
- `GET /api/analytics`

Student imports use a CSV with `sr`, `name`, `class`, and `mobile` columns.
Expenses accept `date`, `amount`, and `purpose`.

All routes except login, registration, and `GET /api/health` require
`Authorization: Bearer <token>`. Tokens expire after 12 hours. Both roles can
use student, attendance, and analytics APIs; fees and expenses APIs require
the `admin` role. Keep the JWT secret and bootstrap admin credentials secure.

## Connection monitoring

Start with driver defaults until the application's concurrency and MongoDB
capacity are known. Monitor MongoDB connection counts and operation latency;
repeated checkout failures or a sustained wait queue indicate pool pressure.
Review query duration and server utilization before increasing pool limits.
