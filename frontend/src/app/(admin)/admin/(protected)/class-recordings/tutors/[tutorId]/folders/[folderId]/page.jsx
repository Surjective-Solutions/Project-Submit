import TutorRecordingsPage from '@/components/admin/class-recordings/TutorRecordingsPage';

// /admin/class-recordings/tutors/:tutorId/folders/:folderId: a folder of that tutor.
export default async function Page({ params }) {
  const { folderId } = await params;
  return <TutorRecordingsPage folderId={folderId} />;
}
