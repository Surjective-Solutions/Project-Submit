import { API_BASE } from '@/lib/api-client';

// Helpers for the admin "My Account" page. Everything here is plain functions so it is easy to test.

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB, same limit as the student registration photo
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// "" when the file is fine, otherwise the message to show.
export function checkPhotoFile(file) {
  if (!file) return 'Choose a photo first.';
  if (!PHOTO_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP photo.';
  if (file.size > MAX_PHOTO_BYTES) return 'That photo is over 2 MB. Choose a smaller one.';
  return '';
}

// "Nimal Kumara Perera" -> "NP"; one word -> its first letter; nothing -> "?".
export function initialsOf(fullName) {
  const words = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  const first = [...words[0]][0];
  const last = words.length > 1 ? [...words[words.length - 1]][0] : '';
  return (first + last).toUpperCase();
}

export function splitName(fullName) {
  const words = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { firstName: words[0] || '', lastName: words.length > 1 ? words[words.length - 1] : '' };
}

// ── Phone: Sri Lankan mobile numbers, typed as 77 123 4567, 0771234567 or +94 77 123 4567 ──

// The 9 digits after the leading 0 / +94 (e.g. "771234567"), or "" when it is not a mobile number.
export function normalizePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length > 9) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^7\d{8}$/.test(digits) ? digits : '';
}

// Live formatting while typing: "77 123 4567". Strips a typed 0 / +94 prefix.
export function formatPhoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length > 9) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5)].filter(Boolean).join(' ');
}

// What the server stores and returns: local form "0771234567".
export function phoneToLocal(value) {
  const digits = normalizePhone(value);
  return digits ? `0${digits}` : '';
}

export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// { fullName?, email?, phone? } with a message for each field that needs fixing. Phone is optional.
export function validateProfile({ fullName, email, phone }) {
  const errors = {};
  const name = String(fullName ?? '').trim();
  if (!name) errors.fullName = 'Enter your name.';
  else if ([...name].filter((ch) => /\p{L}/u.test(ch)).length < 2) errors.fullName = 'Enter your full name.';
  else if (name.length > 100) errors.fullName = 'Keep your name under 100 characters.';

  if (!String(email ?? '').trim()) errors.email = 'Enter your email address.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, e.g. name@example.com.';

  if (String(phone ?? '').trim() && !normalizePhone(phone)) errors.phone = 'Enter a valid mobile number, e.g. 77 123 4567.';
  return errors;
}

// The multipart body for the update call. `removePhoto` and `photo` are never both set.
export function buildUpdateForm({ fullName, email, phone, photoFile, removePhoto }) {
  const form = new FormData();
  form.append('fullName', String(fullName).trim());
  form.append('email', String(email).trim());
  form.append('phone', phoneToLocal(phone));
  if (photoFile) form.append('photo', photoFile);
  else if (removePhoto) form.append('removePhoto', 'true');
  return form;
}

// Merges a server response into the profile the console shows (sidebar, header, this page).
// Anything the server does not send keeps its current value.
export function mergeProfile(base, res) {
  const fullName = res?.fullName ?? base?.fullName ?? '';
  return {
    ...base,
    fullName,
    ...splitName(fullName),
    initials: initialsOf(fullName),
    username: res?.username ?? base?.username ?? '',
    email: res?.email ?? base?.email ?? '',
    phone: res?.phone ?? base?.phone ?? '',
    role: res?.role ?? base?.role,
    photoUrl: res && 'photoUrl' in res ? res.photoUrl || '' : base?.photoUrl || '',
  };
}

// Where to load the photo from: full URLs and data URLs as they are, server paths from the API host.
export function photoSrc(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function errorMessage(error, fallback) {
  const text = String(error?.message || '');
  return text && !/^HTTP Error/i.test(text) ? text : fallback;
}
