'use client';

import AttendancePage from '@/components/admin/attendance/AttendancePage';
import * as teacherApi from '@/attendance/teacherApi';

// The teacher's Attendance section: the admin's attendance check, limited to the students enrolled in this
// teacher's own classes (the server only answers for those). There is no tutor filter, since every class shown is the
// teacher's own, and the student's address is not shown.
export default function TeacherAttendancePage() {
  return (
    <AttendancePage
      api={teacherApi}
      showTutorFilter={false}
      showAddress={false}
      onlyOwnStudents
      subtitle="Scan a student’s barcode to check their attendance in your classes."
    />
  );
}
