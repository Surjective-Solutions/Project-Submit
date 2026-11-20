import LibraryProvider from '@/components/admin/class-recordings/LibraryProvider';

// Loads the tutor's folders and recordings once, so moving between their folders doesn't load them again.
export default async function TutorLayout({ children, params }) {
  const { tutorId } = await params;
  return <LibraryProvider tutorId={tutorId}>{children}</LibraryProvider>;
}
