import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import User from '../models/User.js';
import { httpError } from '../utils/http.js';

const tokenLifetime = '12h';

function createSession(user) {
  return {
    token: jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      { subject: user.userId, issuer: 'maktab-backend', expiresIn: tokenLifetime },
    ),
    tokenType: 'Bearer',
    expiresIn: tokenLifetime,
    user: { userId: user.userId, username: user.username, role: user.role },
  };
}

export async function loginUser(request, response) {
  const { username, password } = request.body ?? {};
  if (typeof username !== 'string' || !username.trim()
      || typeof password !== 'string' || !password) {
    throw httpError('Username and password are required.', 400);
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw httpError('Invalid username or password.', 401);
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError('Invalid username or password.', 401);
  }

  response.json(createSession(user));
}

export async function registerUser(request, response) {
  const { username, password } = request.body ?? {};
  if (typeof username !== 'string' || !/^[a-zA-Z0-9._-]{3,32}$/.test(username.trim())) {
    throw httpError('Username must be 3–32 letters, numbers, dots, underscores, or hyphens.', 400);
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw httpError('Password must be at least 8 characters long.', 400);
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw httpError('Password cannot exceed 72 UTF-8 bytes.', 400);
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (await User.exists({ username: normalizedUsername })) {
    throw httpError('That username is already registered.', 409);
  }

  let user;
  try {
    user = await User.create({
      username: normalizedUsername,
      password,
      userId: randomUUID(),
      role: 'nonAdmin',
    });
  } catch (error) {
    if (error.code === 11000) throw httpError('That username is already registered.', 409);
    throw error;
  }

  response.status(201).json(createSession(user));
}
