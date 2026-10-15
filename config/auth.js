import User from '../models/User.js';

export function validateAuthConfig() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  if (!process.env.BOOTSTRAP_ADMIN_USERNAME?.trim() || !process.env.BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error('BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD are required.');
  }
}

export async function bootstrapAdminUser() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME.trim().toLowerCase();
  if (await User.exists({ username })) return;

  await User.create({
    username,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    userId: process.env.BOOTSTRAP_ADMIN_USER_ID?.trim() || 'admin',
    role: 'admin',
  });
  console.log('Bootstrapped initial admin user');
}
