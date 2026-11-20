'use client';

import { useSearchParams } from 'next/navigation';
import LibraryProvider from '@/components/admin/class-recordings/LibraryProvider';
import TutorRecordingsPage from '@/components/admin/class-recordings/TutorRecordingsPage';
import * as teacherApi from '@/class-recordings/teacherApi';

const BASE = '/teacher/dashboard?section=class-recordings';
// the open folder is in the address (?folder=), so a refresh or the browser's back button keeps you in the same place
const folderHref = (folderId) => (folderId ? `${BASE}&folder=${encodeURIComponent(folderId)}` : BASE);

// The teacher's Class Recordings: their own folders and recordings only. The folders are made by an admin, so there is
// no "New folder" and no folder menu; teachers upload recordings into those folders and manage their own recordings.
// No next/font here: the page uses the font the teacher pages already have.
export default function TeacherClassRecordingsPage() {
  const folderId = useSearchParams().get('folder');
  return (
    <LibraryProvider api={teacherApi} tutorId="me">
      <TutorRecordingsPage folderId={folderId} canManageFolders={false} ownLibrary hrefFor={folderHref} exitHref={null} />
    </LibraryProvider>
  );
}
