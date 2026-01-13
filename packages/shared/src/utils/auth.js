import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function decodeToken(token) {
  return jwt.decode(token);
}

export async function hashPassword(password) {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  const bcrypt = await import('bcryptjs');
  return await bcrypt.compare(password, hash);
}
