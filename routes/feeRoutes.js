import { Router } from 'express';
import { listFees, updateFee } from '../controllers/feeController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.get('/', asyncHandler(listFees));
router.put('/:studentId', asyncHandler(updateFee));

export default router;
