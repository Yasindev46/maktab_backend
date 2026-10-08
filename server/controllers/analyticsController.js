import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { httpError } from '../utils/http.js';

export async function getAnalytics(request, response) {
  const year = String(request.query.year ?? new Date().getFullYear());
  const month = String(request.query.month ?? 'All');
  const className = String(request.query.class ?? 'All');
  const filterType = String(request.query.filter_type ?? 'class');
  const studentId = Number(request.query.student_id);
  if (!/^\d{4}$/.test(year) || (month !== 'All' && !/^(?:[1-9]|1[0-2])$/.test(month))) {
    throw httpError('Choose a valid year and month.', 400);
  }
  const datePattern = new RegExp(`^${year}${month === 'All' ? '' : `-${month.padStart(2, '0')}`}`);

  if (filterType === 'student') {
    if (!Number.isSafeInteger(studentId) || studentId < 1) return response.json([]);
    const [student, records] = await Promise.all([
      Student.findOne({ id: studentId }).select('sr name class').lean(),
      Attendance.find({ student_id: studentId, date: datePattern }).sort({ date: -1 }).select('date status').lean(),
    ]);
    if (!student) return response.json([]);
    return response.json(records.map((record) => ({
      sr: student.sr,
      name: student.name,
      class: student.class,
      date: record.date,
      status: record.status,
    })));
  }

  const studentFilter = className === 'All' ? {} : { class: className };
  const students = await Student.find(studentFilter).sort({ sr: 1 }).lean();
  const records = await Attendance.find({
    student_id: { $in: students.map((student) => student.id) },
    date: datePattern,
  }).select('student_id status').lean();
  const countsByStudent = new Map();
  for (const record of records) {
    const counts = countsByStudent.get(record.student_id) ?? { present: 0, absent: 0 };
    if (record.status === 'Present') counts.present += 1;
    if (record.status === 'Absent') counts.absent += 1;
    countsByStudent.set(record.student_id, counts);
  }
  return response.json(students.map((student) => {
    const counts = countsByStudent.get(student.id) ?? { present: 0, absent: 0 };
    return {
      sr: student.sr,
      name: student.name,
      class: student.class,
      present_count: counts.present,
      absent_count: counts.absent,
      total_days: counts.present + counts.absent,
    };
  }));
}
