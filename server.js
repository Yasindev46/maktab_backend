import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/database.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mongoose from 'mongoose';

const root = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(root, '.env') });

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/students', studentRoutes(upload));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api', (request, response) => {
  response.status(404).json({ error: `API route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
  const status = error.status
    ?? (error instanceof multer.MulterError ? 400 : undefined)
    ?? (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError ? 400 : undefined)
    ?? (error.code === 11000 ? 409 : 500);
  if (status >= 500) console.error(error);
  response.status(status).json({
    error: status >= 500 ? 'The server could not complete the request.' : error.message,
  });
});

try {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`Deeniyat API listening on http://localhost:${port}`);
  });
 
} catch (error) {
  console.error(`MongoDB startup failed: ${error.message}`);
  process.exitCode = 1;
}
