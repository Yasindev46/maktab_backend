import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { httpError, positiveInteger } from '../utils/http.js';

const fixedFee = 2400;

export async function listFees(_request, response) {
  const [students, feeRecords] = await Promise.all([
    Student.find().sort({ sr: 1 }).lean(),
    Fee.find().lean(),
  ]);
  const feesByStudent = new Map(feeRecords.map((fee) => [fee.student_id, fee]));
  response.json(students.map((student) => {
    const fee = feesByStudent.get(student.id);
    return {
      student_id: student.id,
      fee_id: fee?.id ?? fee?._id.toString() ?? 0,
      sr: student.sr,
      name: student.name,
      class: student.class,
      mobile: student.mobile,
      paid_amount: fee?.paid_amount ?? 0,
      notes: fee?.notes ?? '',
    };
  }));
}

export async function updateFee(request, response) {
  const studentId = positiveInteger(request.params.studentId, 'A valid student ID is required.');
  const paidAmount = Number(request.body.paid_amount);
  const notes = String(request.body.notes ?? '').trim();
  if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > fixedFee) {
    throw httpError(`Paid amount must be between ₹0 and ₹${fixedFee}.`, 400);
  }
  if (!await Student.exists({ id: studentId })) throw httpError('Student not found.', 404);
  await Fee.findOneAndUpdate(
    { student_id: studentId },
    { $set: { student_id: studentId, paid_amount: paidAmount, notes } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  response.json({ success: true });
}
