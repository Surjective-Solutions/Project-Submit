// TODO: replace with actual microservice endpoint
const API_BASE = "http://localhost:8080";

async function request(path, options = {}) {
  const { method = "POST", body } = options;
  console.log(`[api-client] ${method} ${API_BASE}${path}`, body);
  // Stub: simulate network delay
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, message: "mock response" };
}

async function actualRequest(path, options = {}) {
  //this is the actual requaet methed that used to call backend api
  const { method = "POST", body } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  return await response.json();
}

//this is api endpoint calling  with method

export async function protectedRequestPath(path, options = {}) {
  const token = sessionStorage.getItem("token");

  const { method = "GET", body = null } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error ${response.status}`);
  }

  return response.json();
}

//this is for protected apis
async function protectedRequest(path, options = {}) {
  const token = sessionStorage.getItem("token");

  const { method = "POST", body } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  return await response.json();
}

//protected request with file handling for FormData
async function protectedRequestWithFileHandling(path, options = {}) {
  const token = sessionStorage.getItem("token");

  const { method = "POST", body } = options;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Only add Content-Type for JSON requests
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body
        ? JSON.stringify(body)
        : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  return await response.json();
}

export async function studentLogin(identifier, password) {
  return actualRequest("/api/auth/student-login", {
    body: { identifier, password },
  });
}

export async function studentRegister(data) {
  // return request("/auth/student/register", { body: data });
  return actualRequest("/api/test/hello", { body: data });
}

export async function sendOtp(identifier) {
  // TODO: POST /auth/otp/send  body: { identifier }
  // Returns: { success: true, expires_in: 45 }
  return { success: true, expires_in: 45 };
}

export async function verifyOtp(otp, identifier) {
  const response = await fetch('/api/test/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      otp: parseInt(otp), 
      identifier: parseInt(identifier) 
    }),
  });
  if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
  return await response.json();
}

export async function resendOtp(phone) {
  return request("/auth/otp/resend", { body: { phone } });
}

export async function instructorLogin(email, password) {
  return actualRequest("/api/auth/instructor-login", {
    body: { email, password },
  });
}

export async function instructorRegister(data) {
  console.log("Registering instructor with data:", data);
  return actualRequest("/api/test/instructor/register", { body: data });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function adminLogin(username, password) {
  return actualRequest("/api/auth/admin-login", {
    body: { username, password },
  });
}

// ── Cashier ───────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function cashierLogin(username, password) {
  return actualRequest("/api/auth/cashier-login", {
    body: { username, password },
  });
}

// ── Teacher ───────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function teacherLogin(username, password) {
  return actualRequest("/api/auth/tutor-login", {
    body: { username, password },
  });
}

// ── Teacher Classes ───────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getClasses() {
  return protectedRequest("/api/class/get-all-classes", { method: "GET" });
}

// submit grades for a submission, as the class's tutor
export async function submitTutorGrades(payload) {
  return protectedRequest("/api/class/submissions/grade", {
    method: "POST",
    body: payload,
  });
}

// edit marks/comments for a submission that's already been graded, as the class's tutor
export async function editTutorSubmissionGrade(payload) {
  return protectedRequest("/api/class/submissions/edit-grade", {
    method: "PUT",
    body: payload,
  });
}

// get pending regrade requests for the tutor's own classes
export async function getPendingRegradeRequests() {
  return protectedRequestPath("/api/class/regrade-requests", { method: "GET" });
}

// get a single regrade request's detail (previous marks, reason, etc), as the class's tutor
export async function getRegradeRequestById(regradeRequestSeq) {
  return protectedRequestPath(`/api/class/regrade-requests/${regradeRequestSeq}`, { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createClass(data) {
  console.log("Creating class with data:", data);
  return protectedRequest("/api/class/create", { body: data });
}

export async function updateClass(id, data) {
  return protectedRequest(`/api/class/update/${id}`, {
    method: "PUT",
    body: {
      display_name: data.display_name,
      description: data.description,
      subject_name: data.subject_name,
      monthly_fee: data.monthly_fee,
    },
  });
}

// TODO: replace with actual microservice endpoint
export async function deleteClass(id) {
  return request(`/teacher/classes/${id}`, { method: "DELETE", body: { id } });
}

// ── Teacher Papers ────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getClassPapers(classId) {
  return request(`/teacher/classes/${classId}/papers`, { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function uploadPaper(classId, paperData) {
  console.log("Uploading paper for classId:", classId, "with data:", paperData);
  if (!classId) {
    classId = 1; // Default classId for testing
  }
  return protectedRequestWithFileHandling(`/api/class/${classId}/uploadpaper`, {
    body: paperData,
  });
}

// edits an existing paper's details, as the class's tutor (only allowed while it has no submissions)
export async function updatePaper(paperId, paperData) {
  return protectedRequestWithFileHandling(`/api/class/edit-paper/${paperId}`, {
    method: "PUT",
    body: paperData,
  });
}


//this is the actual ,ethod to used for send data to backend
export async function uploadAnswerSheet(classId, paperId, answerSheet) {
  const formData = new FormData();

  formData.append("classId", classId);
  formData.append("paperId", paperId);
  formData.append("answerSheet", answerSheet);

  return protectedRequestWithFileHandling(
    "/api/student/answer-sheet/upload",
    {
      body: formData,
    }
  );
}

// soft-deletes a paper, as the class's tutor
export async function deleteUploadPaper(paperId) {
  return protectedRequestPath(`/api/class/delete-paper/${paperId}`, {
    method: "DELETE",
  });
}

// toggles a paper between PUBLISHED and DRAFT, as the class's tutor
export async function toggleClassPaperPublish(paperId) {
  return protectedRequestPath(`/api/class/toggle-paper-publish/${paperId}`, {
    method: "PUT",
  });
}

// ── Teacher Instructors ───────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getInstructors() {
  return protectedRequest("/api/instructor/get-all-instructors", { method: "GET" });
}

//get engaged instructors for a specific tutor
export async function getEngagedInstructors() {
  return protectedRequestPath("/api/tutor/get-engaged-instructors", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createInstructor(data) {
  console.log("Creating instructor with data:", data);
  return protectedRequest("/api/tutor/add/instructor", { body: data });
}

// TODO: replace with actual microservice endpoint
export async function updateInstructor(id, data) {
  return request(`/teacher/instructors/${id}`, { method: "PUT", body: data });
}

// TODO: replace with actual microservice endpoint
export async function deleteInstructor(id) {
  return request(`/teacher/instructors/${id}`, {
    method: "DELETE",
    body: { id },
  });
}

// ── Students ──────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getStudents() {
  return protectedRequest("/api/student/get-all-students", { method: "GET" });
}

//get single student by id for profile display
export async function getStudentById(id) {
  return protectedRequest(`/api/student/get-student/${id}`, { method: 'GET' });
}

//get enrolled classes fro students
export async function getEnrolledClass() {
  return protectedRequest("/api/student/get-all-enrolled-class", { method: "GET" });
}

//api method to handle api request for addClass
export async function addClasstostudent(data) {
  return protectedRequest("/api/student/add-class-student", { body: data });
}

export async function getStudentsTeachers() {
  return protectedRequestPath("/api/tutor/get-all-teachers", { method: "GET" });
}

export async function updateStudent(id, data) {
  return protectedRequestPath(`/api/student/update/${id}`, { method: "PUT", body: data });
}

// get per-question grade breakdown for a graded paper
export async function getGradeDetailsForPaper(paperId) {
  return protectedRequestPath(`/api/student/paper/${paperId}/grade-details`, { method: 'GET' });
}

// submit a regrade request for a graded paper, as the student
export async function createRegradeRequest(paperId, payload) {
  return protectedRequestPath(`/api/student/paper/${paperId}/regrade-request`, {
    method: 'POST',
    body: payload,
  });
}

// get the student's own (most recent) regrade request for a paper, if any
export async function getRegradeRequestForPaper(paperId) {
  return protectedRequestPath(`/api/student/paper/${paperId}/regrade-request`, { method: 'GET' });
}

// ── Admin Instructors ─────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getAdminInstructors() {
  return request("/admin/instructors", { method: "GET" });
}

// export async function updateAdminInstructor(id, data) {
//   return protectedRequest(`/api/instructor/update/${id}`, {
//     method: "PUT",
//     body: {
//       fullName: `${data.first_name} ${data.last_name}`,
//       email: data.email,
      
//       contactNumber: data.contact_number,
//       address: data.address ?? '',
//     },
//   });
// }



export async function updateAdminInstructor(id, data) {
  return protectedRequest(`/api/instructor/update/${id}`, {
    method: "PUT",
    body: {
      firstName: data.first_name,
      lastName: data.last_name,
      employeeId: data.employee_id,
      subjectArea: data.subject_area,
      email: data.email,
      contactNumber: data.contact_number,
      status: data.status,
      ...(data.new_password && {
        password: data.new_password,
      }),
    },
  });
}

// ── Student Profile ───────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getEnrolledClasses() {
  return request("/student/classes", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function getStudentProfile() {
  return request("/student/profile", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function updateStudentProfile(data) {
  return request("/student/profile", { method: "PUT", body: data });
}

// remove/unenroll student from a class
export async function removeClassFromStudent(classId) {
  return protectedRequest("/api/student/remove-class-student", {
    body: { classSeq: classId },
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getPayments() {
  return request("/cashier/payments", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function approvePayment(id, referenceNumber) {
  return protectedRequest(`/api/payments/${id}/approve`, {
    body: { reference_number: referenceNumber },
  });
}

// TODO: replace with actual microservice endpoint
export async function rejectPayment(id, rejectionReason) {
  return protectedRequest(`/api/payments/${id}/reject`, {
    body: { rejection_reason: rejectionReason },
  });
}

// create bank account
export async function createBankAccount(data) {
  return protectedRequest("/api/payments/bank-account/create", { body: data });
}

// update bank account
export async function updateBankAccount(id, data) {
  return protectedRequestPath(`/api/payments/bank-account/update/${id}`, { method: "PUT", body: data });
}

// delete bank account
export async function deleteBankAccount(id) {
  return protectedRequestPath(`/api/payments/bank-account/delete/${id}`, { method: "DELETE" });
}

// TODO: replace with actual microservice endpoint
export async function createStudent(data) {
  return request("/cashier/students", { body: data });
}

// ── Tutors ────────────────────────────────────────────────────────────────────

// get single tutor by ID for profile display
export async function getTutorById(id) {
  return protectedRequest(`/api/tutor/get-tutor/${id}`, { method: "GET" });
}

export async function getTutors() {
  return protectedRequest("/api/tutor/get-all-tutors", { method: "GET" });
}

export async function createTutor(data) {
  return protectedRequest("/api/tutor/create", { body: data });
}

export async function updateTutor(id, data) {
  return protectedRequestPath(`/api/tutor/update/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteTutor(id) {
  return protectedRequestPath(`/api/tutor/delete/${id}`, {
    method: "DELETE",
    body: { id },
  });
}

// admin edits a tutor's profile fields directly, no current-password confirmation required
export async function adminUpdateTutor(id, data) {
  return protectedRequestPath(`/api/tutor/admin/update/${id}`, {
    method: "PUT",
    body: data,
  });
}

// admin resets a tutor's password directly, no current password required
export async function adminResetTutorPassword(id, data) {
  return protectedRequestPath(`/api/tutor/admin/reset-password/${id}`, {
    method: "PUT",
    body: data,
  });
}

// admin activates a tutor account
export async function activateTutor(id) {
  return protectedRequestPath(`/api/tutor/admin/activate/${id}`, {
    method: "PUT",
  });
}

// admin deactivates a tutor account
export async function deactivateTutor(id) {
  return protectedRequestPath(`/api/tutor/admin/deactivate/${id}`, {
    method: "PUT",
  });
}

// toggle a class's active/inactive status
export async function toggleClassStatus(classId) {
  return protectedRequestPath(`/api/class/toggle-status/${classId}`, { method: 'PUT' });
}

// ── Cashiers ──────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getCashiers() {
  return protectedRequestPath("/api/cashier/get-all-cashiers", {
    method: "GET",
  });
}



// TODO: replace with actual microservice endpoint
export async function createCashier(data) {
  return protectedRequest("/api/cashier/create", { body: data });
}

// TODO: replace with actual microservice endpoint
export async function updateCashier(id, data) {
  return protectedRequestPath(`/api/cashier/update/${id}`, {
    method: "PUT",
    body: data,
  });
}

// TODO: replace with actual microservice endpoint
export async function deleteCashier(id) {
  return protectedRequestPath(`/api/cashier/delete/${id}`, {
    method: "DELETE",
    body: { id },
  });
}

export async function getTeacherPapers(teacherId) {
  // TODO: GET /instructor/teachers/:teacherId/papers
  return [];
}

export async function getPaperSubmissions(paperId) {
  // TODO: GET /instructor/papers/:paperId/submissions
  return [];
}

export async function getTeacherPaperSubmissions(classId, paperId) {
  // TODO: GET /teacher/classes/:classId/papers/:paperId/submissions
  return [];
}

export async function teacherGradeSubmission(submissionId, gradeData) {
  // TODO: POST /teacher/submissions/:submissionId/grade
  return {};
}

export async function getSubmissionForGrading(submissionId) {
  // TODO: GET /teacher/submissions/:submissionId
  return {};
}

// export async function submitGrades(submissionId, gradesData) {
//   // TODO: POST /teacher/submissions/:submissionId/grades
//   // body: { awarded_marks: [{ question_id, marks_awarded, comment }] }
//   return {};
// }

// get bank accounts
export async function getBankAccounts() {
  return protectedRequest("/api/payments/get-all-bankAcoounts", {
    method: "GET",
  });
}

//make banktransfer payment
export async function makeBankTransfer(formData) {
  return protectedRequestWithFileHandling("/api/payments/makeBakTransfer", {
    method: "POST",
    body: formData,
  });
}

// TODO: replace with actual microservice endpoint
export async function getPaymentRecords() {
  return protectedRequestPath("/api/payments/get-all-payments", {
    method: "GET",
  });
}

// ── Instructors ──────────────────────────────────────────────────────────────────

//get single instrctor by ID for profile display
export async function getInstructorById(id) {
  return protectedRequest(`/api/instructor/get-instructor/${id}`, { method: 'GET' });
}


export async function getInstructorTeachers() {
  return protectedRequestPath("/api/instructor/get-instructor-teachers", {
    method: "GET",
  });
 }

//this make api call to backend for submit grades
export async function submitGrades(payload) {
  return protectedRequest("/api/instructor/submissions/grade", {
    method: "POST",
    body: payload,
  });
}

// edit marks/comments for a submission that's already been graded, as an instructor
export async function editInstructorSubmissionGrade(payload) {
  return protectedRequest("/api/instructor/submissions/edit-grade", {
    method: "PUT",
    body: payload,
  });
}

// get pending regrade requests across every tutor the instructor is engaged with
export async function getInstructorPendingRegradeRequests() {
  return protectedRequestPath("/api/instructor/regrade-requests", { method: "GET" });
}

// get a single regrade request's detail (previous marks, reason, etc), as an instructor
export async function getInstructorRegradeRequestById(regradeRequestSeq) {
  return protectedRequestPath(`/api/instructor/regrade-requests/${regradeRequestSeq}`, { method: "GET" });
}

