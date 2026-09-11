// Exam-taking flow duration constants (mock values — no backend timing yet).
export const EXAM_DURATION_SECONDS = 2 * 60 * 60; // 2 hours
export const UPLOAD_DURATION_SECONDS = 10 * 60; // 10 minutes

// Mock page count for the placeholder exam viewer since papers aren't
// paginated PDFs yet — each "page" renders a placeholder image.
export const EXAM_MOCK_PAGE_COUNT = 6;

// A paper can live in the current month or any previous month, so flatten
// every month's papers to find the one the student is starting.
export function findPaperInClass(cls, paperId) {
  if (!cls) return null;
  for (const entry of cls.papers_by_month ?? []) {
    const paper = entry.papers.find((p) => String(p.id) === String(paperId));
    if (paper) return paper;
  }
  return null;
}

// Fallback for legacy papers uploaded before per-paper duration existed —
// duration_minutes will be null on those rows until a tutor edits them.
export const DEFAULT_EXAM_DURATION_MINUTES = 120;

export function getExamDurationSeconds(paper) {
  const minutes = paper?.duration_minutes ?? DEFAULT_EXAM_DURATION_MINUTES;
  return minutes * 60;
  
}
