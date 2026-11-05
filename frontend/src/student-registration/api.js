// Student registration API, wired to the backend (admin only):
//   GET  /api/admin/student/check-duplicate?contactNumber=0771234567
//                                      -> { duplicate, name, studentId }
//   POST /api/admin/student/register   multipart: the registration fields, the password and an
//                                      optional `photo` image -> { isSuccess, message, studentId }
//   GET  /api/admin/student/registered-today -> { count }   (no page uses it yet)
//
// Every function returns a Promise and throws an Error (with a message that is safe to show to
// the admin) on failure, so the pages never need to change.
//
// The server repeats every rule the page checks, because the page can be bypassed: the caller is
// an admin, the required fields and phone numbers, age 10 to 30, a unique contact number and email,
// the photo's type and size (it reads the file's contents), and the eight password rules in
// password.js. It assigns the student ID, hashes the password, and never returns it.
//
// Numbers are sent in local format: "0771234567".

import { checkStudentDuplicate, registerStudentAsAdmin } from '@/lib/api-client';

// The student ID is assigned by the server when the account is created, so the pages can only
// say that it is coming until then.
export const STUDENT_ID_PENDING = 'Assigned on registration';

export const students = {
  // Returns { name, studentId } when the contact number already belongs to a student, else null.
  async checkDuplicate(contactNumber) {
    const result = await checkStudentDuplicate(contactNumber);
    if (!result?.isSuccess) {
      throw new Error(result?.message || 'Could not check the contact number. Please try again.');
    }
    return result.duplicate ? { name: result.name, studentId: result.studentId } : null;
  },

  // `payload` is buildPayload() plus `password` and an optional `photo` File.
  // Returns { studentId }.
  async register({ photo, ...fields }) {
    const body = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) body.append(key, String(value));
    });
    if (photo) body.append('photo', photo);

    const result = await registerStudentAsAdmin(body);
    if (!result?.isSuccess) {
      throw new Error(result?.message || 'Could not create the account. Please try again.');
    }
    return { studentId: result.studentId };
  },
};
