import ClassDetailPage from '@/components/admin/classes/ClassDetailPage';
import { TEACHER_CLASSES_ROUTE } from '@/classes/constants';
import { TEACHER_TUTOR_ID } from '@/classes/teacher';

export const metadata = { title: 'Class · Teacher · SubmitX' };

// The teacher's own class: the same page as the admin's, without the Edit option (only the admin changes a class's
// details) and with its back link going to the teacher's class list. In Next.js 16 `params` is a promise.
export default async function Page({ params }) {
  const { classId } = await params;
  return (
    <ClassDetailPage
      key={classId}
      tutorId={TEACHER_TUTOR_ID}
      classId={classId}
      backHref={TEACHER_CLASSES_ROUTE}
      backLabel="My classes"
      hiddenOptions={['edit']}
    />
  );
}
