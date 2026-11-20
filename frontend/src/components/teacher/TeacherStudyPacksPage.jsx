'use client';

import { Plus_Jakarta_Sans } from 'next/font/google';
import StudyPacksPage from '@/components/admin/study-packs/StudyPacksPage';
import * as teacherApi from '@/study-packs/teacherApi';

// Same font request as the dashboard (Plus Jakarta Sans 400-700), so no new font has to be downloaded.
const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

// The teacher's Study Packs: the same list, form and recordings step as the admin account, with the teacher and
// subject fixed to the signed-in teacher, only their own packs and recordings, and no revenue split to set.
export default function TeacherStudyPacksPage() {
  return (
    <div className={font.className}>
      <StudyPacksPage api={teacherApi} ownTeacher />
    </div>
  );
}
