import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { httpError, positiveInteger, todayDate } from '../utils/http.js';

const studentFields = ['sr', 'name', 'class', 'mobile'];

function readStudentInput(body = {}) {
  const student = Object.fromEntries(studentFields.map((field) => [
    field,
    String(body[field] ?? '').trim(),
  ]));
  if (Object.values(student).some((value) => !value)) {
    throw httpError('Serial number, name, class, and mobile number are required.', 400);
  }
  return student;
}

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field.trim());
  if (quoted) throw httpError('The CSV contains an unclosed quoted field.', 400);
  return fields;
}

export async function listStudents(_request, response) {
  const students = await Student.find().sort({ sr: 1 }).lean();
  const attendance = await Attendance.find({
    student_id: { $in: students.map((student) => student.id) },
    date: todayDate(),
  }).select('student_id status').lean();
  const attendanceByStudent = new Map(attendance.map((record) => [record.student_id, record.status]));
  response.json(students.map((student) => ({
    id: student.id,
    sr: student.sr,
    name: student.name,
    class: student.class,
    mobile: student.mobile,
    today_status: attendanceByStudent.get(student.id) || 'Absent',
  })));
}

export async function upsertStudent(request, response) {
  const student = readStudentInput(request.body);
  const record = await Student.findOneAndUpdate(
    { sr: student.sr },
    { $set: student, $setOnInsert: { id: await Student.countDocuments() + 1 } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  response.status(200).json({ success: true, id: record.id });
}

export async function updateStudent(request, response) {
  const id = positiveInteger(request.params.id, 'A valid student ID is required.');
  const student = readStudentInput(request.body);
  const updated = await Student.findOneAndUpdate(
    { id },
    { $set: student },
    { new: true, runValidators: true },
  ).lean();
  if (!updated) throw httpError('Student not found.', 404);
  response.json({ success: true });
}

export async function importStudents(request, response) {
  if (!request.file) throw httpError('Choose a CSV file to import.', 400);
  const contents = request.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
  const rows = contents.split(/\r?\n/).filter((line) => line.trim());
  if (rows.length < 2) {
    throw httpError('The CSV must include a header and at least one student.', 400);
  }

  let count = 0;
  for (const line of rows.slice(1)) {
    const [sr, name, className, mobile] = parseCsvLine(line);
    if (!sr || !name || !className || mobile === undefined) continue;
    await Student.findOneAndUpdate(
      { sr },
      {
        $set: { sr, name, class: className, mobile },
        $setOnInsert: { id: await Student.countDocuments() + 1 },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    count += 1;
  }
  response.json({ success: true, count });
}

export { positiveInteger };
