import ClassDetailPage from '@/components/admin/classes/ClassDetailPage';

export const metadata = { title: 'Class · Classes · Syzygy Admin' };

// In Next.js 16 `params` is a promise.
export default async function Page({ params }) {
  const { tutorId, classId } = await params;
  return <ClassDetailPage key={classId} tutorId={tutorId} classId={classId} />;
}
