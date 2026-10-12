// Placeholder for the PDF endpoint. Replace the body with a real API call that
// returns the PDF (e.g. a Blob) and hand it to a download helper.
//
//   type    one of REPORT_TYPES
//   teacher a teacher from TEACHERS, or ALL_TEACHERS
//   period  the object returned by resolvePeriod() ({ months, label, slug, ... })
export async function generateReportPdf(type, teacher, period) {
  // TODO: POST /api/reports/pdf  { type: type.key, teacherId: teacher.id, months: period.months }
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { generated: false };
}
