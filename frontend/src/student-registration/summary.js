import { STREAMS } from './constants';
import {
  formatDob,
  formatPhoneInput,
  formatPhoneLocal,
  fullName,
  gradeLabel,
  initialsOf,
  isOrdinaryLevel,
  normalizePhone,
} from './utils';

// Everything pages 2 and 3 show about the student, built from the form on page 1.
export function buildSummary(form, studentId) {
  const grade = gradeLabel(form.grade);
  const stream = !isOrdinaryLevel(form.grade) && STREAMS.some((s) => s.value === form.stream) ? form.stream : '';
  const gradeStream = grade ? [grade, stream].filter(Boolean).join(' · ') : 'Not set';
  const guardian = `${form.guardianName.trim()} · ${formatPhoneLocal(form.guardianContact)}`;

  return {
    name: fullName(form),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    initials: initialsOf(form),
    studentId,
    phone: `+94 ${formatPhoneInput(form.contactNumber)}`, // "+94 77 482 1190"
    contactDigits: normalizePhone(form.contactNumber), // "774821190"
    guardian,
    gradeStream,
    rows: [
      ['Student ID', studentId],
      ['Contact number', formatPhoneLocal(form.contactNumber)],
      ['Date of birth', formatDob(form.dateOfBirth)],
      ['Guardian', guardian],
      ['Grade · stream', gradeStream],
      ['District', form.district || 'Not set'],
    ],
  };
}
