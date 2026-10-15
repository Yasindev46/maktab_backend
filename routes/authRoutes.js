import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.post('/loginuser', asyncHandler(loginUser));
router.post('/registeruser', asyncHandler(registerUser));

export default router;
