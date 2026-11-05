// Password rules for a new student account. The server must enforce exactly the same rules,
// because the page can be bypassed. Never log, store or put the password in a URL.

export const COMMON_PASSWORDS = ['password', '12345678', '123456789', 'qwerty', 'abc123', 'syzygy', '11111111', 'letmein'];

const MIN_NAME_LETTERS = 3;
const PHONE_TAIL_DIGITS = 6;
const STRONG_LENGTH = 12;

function letterCount(text) {
  return [...text].filter((ch) => /\p{L}/u.test(ch)).length;
}

// True when the password contains the student's first or last name (3+ letters, any case)
// or the last 6 digits of their phone number.
function containsPersonalInfo(password, { firstName = '', lastName = '', contactDigits = '' }) {
  const lower = password.toLowerCase();
  const names = [firstName, lastName]
    .map((name) => name.replace(/\s+/g, '').toLowerCase())
    .filter((name) => letterCount(name) >= MIN_NAME_LETTERS);
  if (names.some((name) => lower.includes(name))) return true;
  const digits = String(contactDigits).replace(/\D/g, '');
  return digits.length >= PHONE_TAIL_DIGITS && password.includes(digits.slice(-PHONE_TAIL_DIGITS));
}

// The eight rules, in display order. Nothing counts as met while the field is empty.
export function passwordRules(password, student = {}) {
  const has = password.length > 0;
  const lower = password.toLowerCase();
  return [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number (0–9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character, e.g. ! @ # $ %', met: /[^A-Za-z0-9\s]/.test(password) },
    { id: 'spaces', label: 'No spaces', met: has && !/\s/.test(password) },
    { id: 'personal', label: 'No student name or phone number', met: has && !containsPersonalInfo(password, student) },
    { id: 'common', label: 'Not a common password', met: has && !COMMON_PASSWORDS.some((word) => lower.includes(word)) },
  ];
}

export const STRENGTH_LEVELS = [
  { level: 0, label: 'Not set', color: '#dadfe9' },
  { level: 1, label: 'Weak', color: '#e5242b' },
  { level: 2, label: 'Fair', color: '#f6df33' },
  { level: 3, label: 'Good', color: '#08a5e1' },
  { level: 4, label: 'Strong', color: '#0b4f6e' },
];

// Weak: a rule fails and 5 or fewer pass. Fair: 6 or 7 pass. Good: all pass, under 12 characters.
// Strong: all pass, 12 characters or more.
export function passwordStrength(password, rules) {
  if (!password) return STRENGTH_LEVELS[0];
  const passed = rules.filter((rule) => rule.met).length;
  if (passed < rules.length) return passed <= 5 ? STRENGTH_LEVELS[1] : STRENGTH_LEVELS[2];
  return password.length >= STRONG_LENGTH ? STRENGTH_LEVELS[4] : STRENGTH_LEVELS[3];
}

export function unmetCount(rules) {
  return rules.filter((rule) => !rule.met).length;
}

// "Passwords don't match" shows once the confirm field is as long as the password, or after a submit attempt.
export function mismatchShown(password, confirm, submitted) {
  return confirm !== password && (confirm.length >= password.length || submitted);
}

export function passwordsMatch(password, confirm) {
  return confirm.length > 0 && confirm === password;
}
