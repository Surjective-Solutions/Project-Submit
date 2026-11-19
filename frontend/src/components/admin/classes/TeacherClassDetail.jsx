'use client';

import { TEACHER_CLASSES_ROUTE } from '@/classes/constants';
import { useTeacherId } from '@/classes/teacher';
import ClassDetailPage from './ClassDetailPage';
import styles from './classes.module.css';

// The teacher's own class: the admin's class page, without the Edit option (only the admin changes a class's
// details) and with its back link going to the teacher's class list. The teacher's id comes from the login token.
export default function TeacherClassDetail({ classId }) {
  const tutorId = useTeacherId();
  if (tutorId === undefined) {
    return (
      <div className={styles.page}>
        <div aria-busy="true" role="status" aria-label="Loading class" className={styles.detailSkeleton}>
          <div className={`${styles.skeleton} ${styles.skeletonProfile}`} />
        </div>
      </div>
    );
  }
  return (
    <ClassDetailPage
      key={classId}
      tutorId={tutorId ?? ''}
      classId={classId}
      backHref={TEACHER_CLASSES_ROUTE}
      backLabel="My classes"
      hiddenOptions={['edit']}
    />
  );
}