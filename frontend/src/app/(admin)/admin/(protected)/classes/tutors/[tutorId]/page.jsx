import TutorDetailPage from '@/components/admin/classes/TutorDetailPage';

export const metadata = { title: 'Tutor · Classes · Syzygy Admin' };

// In Next.js 16 `params` is a promise.
export default async function Page({ params }) {
  const { tutorId } = await params;
  return <TutorDetailPage key={tutorId} tutorId={tutorId} />;
}
