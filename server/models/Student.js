import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  sr: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  class: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
}, {
  versionKey: false,
  collection: 'students',
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
