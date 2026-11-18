// Which tutor the signed-in teacher is, for the teacher's Classes section.
//
// The classes data is still the mock API, whose tutors have ids like "t-perera". Until there is a backend for it,
// every teacher sees this tutor's classes. When the endpoints exist, replace this with the signed-in teacher's own
// id (the token's userSeq, as TeacherSidebar already reads it) and let the server return only that teacher's
// classes; GET /classes/:id must answer 404 for a class that belongs to another teacher.
export const TEACHER_TUTOR_ID = 't-perera';
