// Placeholder for the teacher's PDF endpoint. Replace the body with a real API call that returns the PDF
// (e.g. a Blob) and hand it to a download helper.
//
//   type    one of REPORT_TYPES (teacher-reports/config.js)
//   period  the object returned by resolvePeriod() ({ months, from, to, label, slug, ... })
//
// There is no teacher argument: the server takes the teacher from the login token, never from the request.
//
// Planned endpoints (tutor role, everything scoped to the token's teacher):
//   GET  /api/reports/mine/{type}?from=YYYY-MM-DD&to=YYYY-MM-DD   -> the rows (same shapes as reports/generators.js)
//   POST /api/reports/mine/pdf   { type, from, to }               -> the PDF
// The server must repeat the rules the page checks: from <= to, not in the future, not before 2025-01-01, and only
// the teacher's own classes, students and study packs.
export async function generateReportPdf(type, teacher, period) {
  // TODO: POST /api/reports/mine/pdf  { type: type.key, from: period.from, to: period.to }
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { generated: false };
}
