import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  id: { type: Number },
  student_id: { type: Number, required: true, unique: true },
  paid_amount: { type: Number, required: true, default: 0, min: 0, max: 2400 },
  notes: { type: String, default: '', trim: true },
}, {
  versionKey: false,
  collection: 'fees_records',
});

export default mongoose.models.Fee || mongoose.model('Fee', feeSchema);
