# Deeniyat Maktab API

Express API for student rosters, attendance, fee payments, reports, and
expenses. Data is stored in MongoDB through Mongoose.

## Requirements

- Node.js 22.13 or later
- npm
- A MongoDB deployment or local MongoDB server

## Run

Install dependencies and set the MongoDB connection string in `server/.env`,
then start the API:

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
- `CLIENT_URL`: Allowed frontend origin; multiple origins can be comma-separated.

The MongoDB client is shared for the lifetime of the server and uses the Node
driver's default pool settings. `GET /api/health` reports whether the database
connection is ready.

## Data model

- `students`: numeric `id`, `sr`, `name`, `class`, and `mobile`.
- `attendance_records`: `student_id`, ISO date string, and `Present`/`Absent` status.
- `fees_records`: unique `student_id`, `paid_amount`, and optional `notes`.
- `expenses_records`: numeric `id`, `paid_amount`, `purpose`, and ISO date string.

The models use the existing MongoDB collection names. The numeric student ID is
kept in API responses so the existing client and imported records continue to
work. Student and expense IDs are allocated atomically and continue from the
largest existing ID in their collection.

## API routes

- `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`,
  `POST /api/students/import`
- `POST /api/attendance/mark-all`, `POST /api/attendance/finalize`,
  `POST /api/attendance/:studentId`
- `GET /api/fees`, `PUT /api/fees/:studentId`
- `GET /api/expenses`, `POST /api/expenses`
- `GET /api/analytics`

Student imports use a CSV with `sr`, `name`, `class`, and `mobile` columns.
Expenses accept `date`, `amount`, and `purpose`.

The application does not include API-token authentication. Configure
authentication before exposing this API publicly if required.

## Connection monitoring

Start with driver defaults until the application's concurrency and MongoDB
capacity are known. Monitor MongoDB connection counts and operation latency;
repeated checkout failures or a sustained wait queue indicate pool pressure.
Review query duration and server utilization before increasing pool limits.
