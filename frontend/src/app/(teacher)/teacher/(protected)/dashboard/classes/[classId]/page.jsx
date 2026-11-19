import TeacherClassDetail from '@/components/admin/classes/TeacherClassDetail';

export const metadata = { title: 'Class · Teacher · SubmitX' };

// The teacher's own class page. In Next.js 16 `params` is a promise.
export default async function Page({ params }) {
  const { classId } = await params;
    return <TeacherClassDetail classId={classId} />;    
}
