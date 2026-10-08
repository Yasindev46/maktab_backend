import Expense from '../models/Expense.js';
import { httpError } from '../utils/http.js';

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function listExpenses(_request, response) {
  const expenses = await Expense.find().sort({ date: -1, id: -1 }).lean();
  response.json(expenses.map((expense) => ({
    exp_id: expense.id,
    date: expense.date,
    amount: expense.paid_amount,
    purpose: expense.purpose,
  })));
}

export async function createExpense(request, response) {
  const date = String(request.body.date ?? '').trim();
  const purpose = String(request.body.purpose ?? '').trim();
  const amount = Number(request.body.amount ?? request.body.paid_amount);
  if (!isValidDate(date)) throw httpError('Enter a valid expense date.', 400);
  if (!purpose || purpose.length > 200) {
    throw httpError('Purpose is required and must be 200 characters or fewer.', 400);
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw httpError('Amount must be greater than zero.', 400);
  }
  const expense = await Expense.create({
    id: await Expense.countDocuments() + 1,
    date,
    paid_amount: amount,
    purpose,
  });
  response.status(201).json({
    success: true,
    expense: {
      exp_id: expense.id,
      date: expense.date,
      amount: expense.paid_amount,
      purpose: expense.purpose,
    },
  });
}

export async function deleteExpense(request, response) {
  const id = Number(request.params.id);
  console.log('Deleting expense with ID:', id);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError('A valid expense ID is required.', 400);
  }
  const result = await Expense.deleteOne({ id: id });
  // if (result.deletedCount === 0) {
  //   throw httpError(`Expense with ID ${id} not found.`, 404);
  // }
  response.json({ success: true });
}