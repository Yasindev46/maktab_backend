import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: {
    type: String,
    required: true,
    select: false,
    validate: {
      validator: (password) => Buffer.byteLength(password, 'utf8') <= 72,
      message: 'Password cannot exceed 72 UTF-8 bytes.',
    },
  },
  userId: { type: String, required: true, unique: true, trim: true },
  role: { type: String, required: true, enum: ['admin', 'nonAdmin'] },
}, { versionKey: false, collection: 'users' });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.models.User || mongoose.model('User', userSchema);
