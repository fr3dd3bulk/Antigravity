import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function getKey(salt) {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-this-now!!';
  return crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
}

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey(salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(text), 'utf8'),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decrypt(encryptedData) {
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, TAG_POSITION);
  const tag = buffer.slice(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = buffer.slice(ENCRYPTED_POSITION);
  
  const key = getKey(salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
