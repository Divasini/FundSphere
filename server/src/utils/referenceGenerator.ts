import crypto from 'crypto';

export const generateTransactionReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${timestamp}-${randomHex}`;
};

export const generateRefundReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `REF-${timestamp}-${randomHex}`;
};

export const generateSlug = (text: string): string => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${randomSuffix}`;
};
