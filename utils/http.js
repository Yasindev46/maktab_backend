export function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

export function positiveInteger(value, message) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw httpError(message, 400);
  return parsed;
}

export function todayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
