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
  // TODO: POST /auth/otp/verify  body: { otp, identifier }
  // Returns: { success: true, token, user }
  return { success: true };
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
  return request("/auth/cashier/login", { body: { username, password } });
}

// ── Teacher ───────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function teacherLogin(username, password) {
  return request("/auth/teacher/login", { body: { username, password } });
}

// ── Teacher Classes ───────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getClasses() {
  return request("/teacher/classes", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createClass(data) {
  return request("/teacher/classes", { body: data });
}

// TODO: replace with actual microservice endpoint
export async function updateClass(id, data) {
  return request(`/teacher/classes/${id}`, { method: "PUT", body: data });
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
  return request(`/teacher/classes/${classId}/papers`, { body: paperData });
}

// TODO: replace with actual microservice endpoint
export async function updatePaper(paperId, paperData) {
  return request(`/teacher/papers/${paperId}`, {
    method: "PUT",
    body: paperData,
  });
}

// TODO: replace with actual microservice endpoint
export async function deletePaper(paperId) {
  return request(`/teacher/papers/${paperId}`, {
    method: "DELETE",
    body: { id: paperId },
  });
}

// TODO: replace with actual microservice endpoint
export async function publishPaper(paperId) {
  return request(`/teacher/papers/${paperId}/publish`, { body: {} });
}

// TODO: replace with actual microservice endpoint
export async function unpublishPaper(paperId) {
  return request(`/teacher/papers/${paperId}/unpublish`, { body: {} });
}

// ── Teacher Instructors ───────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getInstructors() {
  return request("/teacher/instructors", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createInstructor(data) {
  return request("/teacher/instructors", { body: data });
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
  return request("/admin/students", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function updateStudent(id, data) {
  return request(`/admin/students/${id}`, { method: "PUT", body: data });
}

// ── Admin Instructors ─────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getAdminInstructors() {
  return request("/admin/instructors", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function updateAdminInstructor(id, data) {
  return request(`/admin/instructors/${id}`, { method: "PUT", body: data });
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

// ── Payments ──────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getPayments() {
  return request("/cashier/payments", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function approvePayment(id, referenceNumber) {
  return request(`/cashier/payments/${id}/approve`, {
    body: { reference_number: referenceNumber },
  });
}

// TODO: replace with actual microservice endpoint
export async function rejectPayment(id, rejectionReason) {
  return request(`/cashier/payments/${id}/reject`, {
    body: { rejection_reason: rejectionReason },
  });
}

// TODO: replace with actual microservice endpoint
export async function createStudent(data) {
  return request("/cashier/students", { body: data });
}

// ── Tutors ────────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getTutors() {
  return request("/admin/tutors", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createTutor(data) {
  return request("/admin/tutors", { body: data });
}

// TODO: replace with actual microservice endpoint
export async function updateTutor(id, data) {
  return request(`/admin/tutors/${id}`, { method: "PUT", body: data });
}

// TODO: replace with actual microservice endpoint
export async function deleteTutor(id) {
  return request(`/admin/tutors/${id}`, { method: "DELETE", body: { id } });
}

// ── Cashiers ──────────────────────────────────────────────────────────────────

// TODO: replace with actual microservice endpoint
export async function getCashiers() {
  return request("/admin/cashiers", { method: "GET" });
}

// TODO: replace with actual microservice endpoint
export async function createCashier(data) {
  return request("/admin/cashiers", { body: data });
}

// TODO: replace with actual microservice endpoint
export async function updateCashier(id, data) {
  return request(`/admin/cashiers/${id}`, { method: "PUT", body: data });
}

// TODO: replace with actual microservice endpoint
export async function deleteCashier(id) {
  return request(`/admin/cashiers/${id}`, { method: "DELETE", body: { id } });
}

export async function getTeacherPapers(teacherId) {
  // TODO: GET /instructor/teachers/:teacherId/papers
  return [];
}

export async function getPaperSubmissions(paperId) {
  // TODO: GET /instructor/papers/:paperId/submissions
  return [];
}
