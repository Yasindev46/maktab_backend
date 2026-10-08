import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { httpError, positiveInteger, todayDate } from '../utils/http.js';

async function studentsInClass(className) {
  const filter = className === 'All' ? {} : { class: className };
  return Student.find(filter).select('id').lean();
}

export async function markAllPresent(request, response) {
  const className = String(request.body.class ?? 'All').trim();
  const targetStudents = await studentsInClass(className);
  const date = todayDate();
  if (targetStudents.length) {
    await Attendance.bulkWrite(targetStudents.map(({ id }) => ({
      updateOne: {
        filter: { student_id: id, date },
        update: {
          $set: { student_id: id, date, status: 'Present' },
        },
        upsert: true,
      },
    })));
  }
  response.json({ success: true });
}

export async function finalizeAttendance(request, response) {
  const className = String(request.body.class ?? 'All').trim();
  const targetStudents = await studentsInClass(className);
  const date = todayDate();
  if (!targetStudents.length) return response.json({ success: true, count: 0 });

  const result = await Attendance.bulkWrite(targetStudents.map(({ id }) => ({
    updateOne: {
      filter: { student_id: id, date },
      update: { $setOnInsert: { student_id: id, date, status: 'Absent' } },
      upsert: true,
    },
  })));
  response.json({ success: true, count: result.upsertedCount });
}

export async function setAttendance(request, response) {
  const studentId = positiveInteger(request.params.studentId, 'A valid student ID is required.');
  const { status } = request.body;
  if (status !== 'Present' && status !== 'Absent') {
    throw httpError('Attendance status must be Present or Absent.', 400);
  }
  if (!await Student.exists({ id: studentId })) throw httpError('Student not found.', 404);
  const date = todayDate();
  await Attendance.findOneAndUpdate(
    { student_id: studentId, date },
    { $set: { student_id: studentId, date, status } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  response.json({ success: true });
}
