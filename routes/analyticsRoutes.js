import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.get('/', asyncHandler(getAnalytics));

export default router;
