// Student registration API — stubbed in memory until the backend exists.
//
// Every function returns a Promise and throws an Error (with a message that is safe to show to
// the admin) on failure, so the page never needs to change when real calls replace these.
//
// Planned endpoints (admin-only, via protectedRequestPath):
//   GET  /api/student/check-duplicate?contactNumber=0771234567   -> { name, studentId } or 404
//   POST /api/student/register          JSON StudentRegistration  -> { studentId }
//   POST /api/upload/profile-photo      multipart file            -> { url }
//   GET  /api/student/registered-today                            -> { count }
//
// The server must repeat every rule the page checks, because the page can be bypassed:
//   - the caller is an admin
//   - names, contact number, date of birth, gender, address, guardian name and guardian contact are present
//   - phone numbers are Sri Lankan mobile numbers (7 followed by 8 digits); age is 10 to 30
//   - email and WhatsApp number are valid when given
//   - the contact number is not already registered (return 409 with the existing student)
//   - the photo is JPG, PNG or WebP and under 2 MB (check the file contents, not only the name)
//   - the student ID (prefix by grade + 5-digit running number) is assigned on the server
//
// Numbers are sent in local format: "0771234567".

import { formatStudentId, normalizePhone } from './utils';

const LATENCY_MS = 350;

const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data: 077 123 4567 already belongs to a student.
const registered = [{ contact: '771234567', name: 'Kavindi S. Dissanayake', studentId: 'SY-26-04821' }];
let nextNumber = 4822;
let todayCount = 12;

// Mock only: the page shows the ID the next student will get. The real server assigns it on
// registration, so remove this when the backend exists.
export function peekStudentId(grade) {
  return formatStudentId(grade, nextNumber);
}

export const students = {
  async checkDuplicate(contactNumber) {
    await wait(250);
    const key = normalizePhone(contactNumber);
    const match = registered.find((student) => student.contact === key);
    return match ? { name: match.name, studentId: match.studentId } : null;
  },

  async register(payload) {
    await wait();
    if (!payload.firstName || !payload.lastName || !payload.contactNumber) {
      throw new Error('Some required details are missing.');
    }
    const key = normalizePhone(payload.contactNumber);
    if (registered.some((student) => student.contact === key)) {
      throw new Error('This contact number is already registered.');
    }
    const studentId = formatStudentId(payload.grade, nextNumber);
    nextNumber += 1;
    todayCount += 1;
    registered.push({ contact: key, name: `${payload.firstName} ${payload.lastName}`, studentId });
    return { studentId };
  },

};

export const uploads = {
  // Mock: returns the file as a data URL. The real call returns the stored file's address.
  async profilePhoto(file) {
    await wait(200);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not upload the photo. Please try again.'));
      reader.readAsDataURL(file);
    });
  },
};
