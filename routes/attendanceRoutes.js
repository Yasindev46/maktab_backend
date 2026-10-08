import { Router } from 'express';
import {
  finalizeAttendance,
  markAllPresent,
  setAttendance,
} from '../controllers/attendanceController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.post('/mark-all', asyncHandler(markAllPresent));
router.post('/finalize', asyncHandler(finalizeAttendance));
router.post('/:studentId', asyncHandler(setAttendance));

export default router;
