import { Router } from 'express';
import { createExpense, listExpenses,deleteExpense } from '../controllers/expenseController.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.get('/', asyncHandler(listExpenses));
router.post('/', asyncHandler(createExpense));
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
