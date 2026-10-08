import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  paid_amount: { type: Number, required: true, min: 0.01 },
  purpose: { type: String, required: true, trim: true, maxlength: 200 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
}, {
  versionKey: false,
  collection: 'expenses_records',
});

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
