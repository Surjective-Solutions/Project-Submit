import {
  ADDRESS_MIN,
  AGE_MAX,
  AGE_MIN,
  DELIVERY_FIELDS,
  FIELD_ORDER,
  GUARDIAN_FIELDS,
  GRADES,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  STUDENT_FIELDS,
} from './constants';

export const PHONE_MESSAGE = 'Enter a 9-digit mobile number, e.g. 77 123 4567';
export const DOB_MESSAGE = 'Check the date. The student should be 10 to 30 years old.';
export const EMAIL_MESSAGE = 'Enter a valid email address, e.g. student@gmail.com';
export const POSTAL_MESSAGE = 'Enter a 5-digit postal code, e.g. 20400';
export const NIC_MESSAGE = 'Enter a valid NIC, e.g. 200912345678 or 912345678V';

// ── Phone numbers ───────────────────────────────────────────────────────

// Digits only, without a leading 94 or 0. A valid mobile number is then 7 + 8 digits.
export function normalizePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('94')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isValidPhone(value) {
  return /^7\d{8}$/.test(normalizePhone(value));
}

// What the phone inputs show while typing: "77 123 4567".
export function formatPhoneInput(value) {
  const digits = normalizePhone(value).slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean);
  return parts.join(' ');
}

// Local display format: "077 123 4567".
export function formatPhoneLocal(value) {
  const digits = normalizePhone(value);
  if (digits.length !== 9) return String(value ?? '');
  return `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

// Format sent to the server: "0771234567".
export function toApiNumber(value) {
  return `0${normalizePhone(value)}`;
}

// ── Dates ───────────────────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(2, '0');
}

// Today in the browser's own time zone, as yyyy-mm-dd (what <input type="date" max> expects).
export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parseIso(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return { y, m, d };
}

export function ageFromDob(iso, now = new Date()) {
  const dob = parseIso(iso);
  if (!dob) return null;
  let age = now.getFullYear() - dob.y;
  const beforeBirthday = now.getMonth() + 1 < dob.m || (now.getMonth() + 1 === dob.m && now.getDate() < dob.d);
  if (beforeBirthday) age -= 1;
  return age;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2009-03-05" -> "5 Mar 2009"
export function formatDob(iso) {
  const dob = parseIso(iso);
  if (!dob) return '';
  return `${dob.d} ${MONTHS[dob.m - 1]} ${dob.y}`;
}

// ── Names, grade and student ID ─────────────────────────────────────────

export function fullName(form) {
  return `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
}

export function initialsOf(form) {
  const first = form.firstName.trim()[0] || '';
  const last = form.lastName.trim()[0] || '';
  return `${first}${last}`.toUpperCase();
}

export function isOrdinaryLevel(grade) {
  return grade === '10' || grade === '11';
}

// Grades 12 and 13 (A/L) need a subject stream.
export function isAdvancedLevel(grade) {
  return grade === '12' || grade === '13';
}

// Exam years offered in the dropdown: this year and the next four.
export function examYearOptions(now = new Date()) {
  const first = now.getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({ value: String(first + i), label: String(first + i) }));
}

// NIC: old format (9 digits + V or X) or new format (12 digits). Spaces are ignored.
export function normalizeNic(value) {
  return String(value ?? '').replace(/\s/g, '').toUpperCase();
}

export function isValidNic(value) {
  return /^(\d{9}[VX]|\d{12})$/.test(normalizeNic(value));
}

export function gradeLabel(grade) {
  return GRADES.find((g) => g.value === grade)?.label || '';
}

// G13 -> SY-26-, G12 -> SY-27-, G10/G11 -> SY-OL-. With no grade chosen yet, the A/L 2026 prefix is shown.
export function idPrefix(grade) {
  if (grade === '12') return 'SY-27-';
  if (isOrdinaryLevel(grade)) return 'SY-OL-';
  return 'SY-26-';
}

export function formatStudentId(grade, number) {
  return `${idPrefix(grade)}${String(number).padStart(5, '0')}`;
}

// ── Validation ──────────────────────────────────────────────────────────

// Returns { fieldName: message } for everything that is wrong. Optional fields are only checked when filled.
export function validate(form, { sameWhatsapp, now = new Date() } = {}) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'Enter the first name';
  if (!form.lastName.trim()) errors.lastName = 'Enter the last name';
  if (!isValidPhone(form.contactNumber)) errors.contactNumber = PHONE_MESSAGE;

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Enter the date of birth';
  } else {
    const age = ageFromDob(form.dateOfBirth, now);
    if (age === null || age < AGE_MIN || age > AGE_MAX) errors.dateOfBirth = DOB_MESSAGE;
  }

  if (!form.gender) errors.gender = 'Select a gender';
  if (form.address.trim().length < ADDRESS_MIN) {
    errors.address = `Enter the full address (at least ${ADDRESS_MIN} characters)`;
  }

  if (!form.guardianName.trim()) errors.guardianName = "Enter the guardian's name";
  if (!isValidPhone(form.guardianContact)) errors.guardianContact = PHONE_MESSAGE;

  // Delivery details: everything is required except the postal code (checked only when filled).
  if (!form.city.trim()) errors.city = 'Enter the city';
  if (form.postalCode.trim() && !/^\d{5}$/.test(form.postalCode.trim())) errors.postalCode = POSTAL_MESSAGE;
  if (!form.district) errors.district = 'Select a district';

  // Additional information: everything is required except the photo and the NIC.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = form.email.trim() ? EMAIL_MESSAGE : 'Enter the email address';
  }
  if (!form.school.trim()) errors.school = 'Enter the school name';
  if (form.nic.trim() && !isValidNic(form.nic)) errors.nic = NIC_MESSAGE; // optional: checked only when filled
  if (!sameWhatsapp && !isValidPhone(form.whatsappNumber)) errors.whatsappNumber = PHONE_MESSAGE;
  if (!form.grade) errors.grade = 'Select a grade';
  if (isAdvancedLevel(form.grade) && !form.stream) errors.stream = 'Select a subject stream';
  if (!form.medium) errors.medium = 'Select a medium';
  if (!form.examYear) errors.examYear = 'Select the exam year';

  return errors;
}

export function firstErrorField(errors) {
  return FIELD_ORDER.find((name) => errors[name]) || null;
}

// How many required fields in a group are filled in correctly.
export function countDone(names, errors) {
  return names.filter((name) => !errors[name]).length;
}

export const STUDENT_TOTAL = STUDENT_FIELDS.length;
export const GUARDIAN_TOTAL = GUARDIAN_FIELDS.length;
export const DELIVERY_TOTAL = DELIVERY_FIELDS.length;

// The required fields of the Additional information card. The stream only counts for A/L grades and the
// WhatsApp number only when it differs from the contact number. The photo and the NIC are optional.
export function requiredAdditionalFields(form, { sameWhatsapp }) {
  return [
    'email',
    'school',
    ...(sameWhatsapp ? [] : ['whatsappNumber']),
    'grade',
    ...(isAdvancedLevel(form.grade) ? ['stream'] : []),
    'medium',
    'examYear'
  ];
}

// ── Profile photo ───────────────────────────────────────────────────────

// Returns an error message, or '' when the file is fine.
export function checkPhotoFile(file) {
  if (!file) return '';
  if (!PHOTO_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP image.';
  if (file.size > PHOTO_MAX_BYTES) return 'The photo must be under 2 MB.';
  return '';
}

// ── Payload ─────────────────────────────────────────────────────────────

// StudentRegistration. Optional fields that are empty are left out. `photo` is added after the upload.
export function buildPayload(form, { sameWhatsapp }) {
  const contactNumber = toApiNumber(form.contactNumber);
  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    contactNumber,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    address: form.address.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim() || undefined,
    guardianName: form.guardianName.trim(),
    guardianContact: toApiNumber(form.guardianContact),
    email: form.email.trim(),
    nic: form.nic.trim() ? normalizeNic(form.nic) : undefined,
    whatsappNumber: sameWhatsapp ? contactNumber : toApiNumber(form.whatsappNumber),
    school: form.school.trim(),
    grade: form.grade,
    stream: isAdvancedLevel(form.grade) ? form.stream : undefined,
    medium: form.medium,
    examYear: Number(form.examYear),
    district: form.district,
  };
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

// Where "View student" and the duplicate banner link to. Change this if the Students record lives elsewhere.
export function studentHref(studentId) {
  return `/admin/students/${encodeURIComponent(studentId)}`;
}
