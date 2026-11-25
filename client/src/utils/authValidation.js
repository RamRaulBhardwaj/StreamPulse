export const BLOCKED_LOCAL_PARTS = [
  'fake',
  'test',
  'dummy',
  'asdf',
  'qwerty',
  'abc',
  '123',
  'temp',
  'noreply'
];

export const BLOCKED_DOMAINS = [
  'example.com',
  'test.com',
  'fake.com',
  'mailinator.com',
  'yopmail.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com'
];

export const DEMO_LOGIN_EMAILS = [
  'viewer@example.com',
  'creator@example.com',
  'admin@example.com'
];

/**
 * Validates email format, fake local parts, and disposable domains.
 * Returns { valid: boolean, error?: string, domain?: string, localPart?: string }
 */
export const validateEmailFormatAndBlocklist = (email, { isLogin = false } = {}) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is invalid' };
  }

  const trimmed = email.trim().toLowerCase();

  // Allow pre-configured demo logins in Login mode
  if (isLogin && DEMO_LOGIN_EMAILS.includes(trimmed)) {
    return { valid: true, email: trimmed, domain: 'example.com', localPart: trimmed.split('@')[0] };
  }

  // Reject spaces
  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Exactly one '@' symbol
  const atParts = trimmed.split('@');
  if (atParts.length !== 2) {
    return { valid: false, error: 'Email is invalid' };
  }

  const [localPart, domainPart] = atParts;

  // Local part checks: cannot be empty, cannot start/end with dot, no consecutive dots
  if (
    !localPart ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Local part characters check
  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(localPart)) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Reject fake/dummy local parts (exact match, case-insensitive)
  if (BLOCKED_LOCAL_PARTS.includes(localPart)) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Domain part checks: cannot be empty, cannot start/end with dot, no consecutive dots
  if (
    !domainPart ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.includes('..')
  ) {
    return { valid: false, error: 'Email is invalid' };
  }

  const domainParts = domainPart.split('.');
  // Must have at least two parts: name and TLD (e.g. example.com)
  if (domainParts.length < 2) {
    return { valid: false, error: 'Email is invalid' };
  }

  // TLD check: at least 2 alphabetic characters (rejects .c, .1, etc.)
  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Reject single-character domain names like j.com or a.co
  // The domain label immediately preceding the TLD must have at least 2 characters
  const sld = domainParts[domainParts.length - 2];
  if (!sld || sld.length < 2) {
    return { valid: false, error: 'Email is invalid' };
  }

  // Validate all domain labels (only alphanumeric and hyphens, no leading/trailing hyphens)
  for (const part of domainParts) {
    if (
      !part ||
      part.startsWith('-') ||
      part.endsWith('-') ||
      !/^[a-zA-Z0-9-]+$/.test(part)
    ) {
      return { valid: false, error: 'Email is invalid' };
    }
  }

  // Reject known fake/disposable domains
  const isBlockedDomain = BLOCKED_DOMAINS.some(
    (blocked) => domainPart === blocked || domainPart.endsWith(`.${blocked}`)
  );
  if (isBlockedDomain) {
    return { valid: false, error: 'Email is invalid' };
  }

  return { valid: true, email: trimmed, domain: domainPart, localPart };
};

/**
 * Password validation:
 * 1. Must contain at least one letter and one number
 * 2. Minimum length of 6 characters
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: "Your password doesn't contain a letter or number, try adding some"
    };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters'
    };
  }

  return { valid: true };
};
