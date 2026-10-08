import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  id: { type: Number },
  student_id: { type: Number, required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status: { type: String, required: true, enum: ['Present', 'Absent'] },
}, {
  versionKey: false,
  collection: 'attendance_records',
});

attendanceSchema.index({ student_id: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
