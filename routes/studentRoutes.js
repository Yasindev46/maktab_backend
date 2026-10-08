import { Router } from 'express';
import {
  importStudents,
  listStudents,
  updateStudent,
  upsertStudent,
} from '../controllers/studentController.js';
import { asyncHandler } from '../utils/http.js';

export default function studentRoutes(upload) {
  const router = Router();
  router.get('/', asyncHandler(listStudents));
  router.post('/', asyncHandler(upsertStudent));
  router.put('/:id', asyncHandler(updateStudent));
  router.post('/import', upload.single('csv_file'), asyncHandler(importStudents));
  return router;
}
