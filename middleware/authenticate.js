import jwt from 'jsonwebtoken';

function unauthorized(response) {
  return response.status(401).json({ error: 'Authentication required.' });
}

export default function authenticate(request, response, next) {
  const match = (request.get('authorization') ?? '').match(/^Bearer\s+(\S+)$/i);
  if (!match) return unauthorized(response);

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, { issuer: 'maktab-backend' });
  } catch {
    return unauthorized(response);
  }

  if (typeof payload === 'string'
      || typeof payload.sub !== 'string'
      || !['admin', 'nonAdmin'].includes(payload.role)) {
    return unauthorized(response);
  }

  request.auth = { userId: payload.sub, role: payload.role };
  return next();
}

export function requireAdmin(request, response, next) {
  if (request.auth?.role !== 'admin') {
    return response.status(403).json({ error: 'Administrator access required.' });
  }
  return next();
}
