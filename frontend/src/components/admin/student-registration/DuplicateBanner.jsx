import { forwardRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { studentHref } from '@/student-registration/utils';
import styles from './registration.module.css';

// Shown at the top of the form when the contact number already belongs to a student. Registration is blocked.
const DuplicateBanner = forwardRef(function DuplicateBanner({ duplicate }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" className={styles.banner}>
      <Icon name="warning" size={22} fill style={{ color: '#8A6D00' }} />
      <p className={styles.bannerText}>
        This contact number is already registered to{' '}
        <strong>
          {duplicate.name} ({duplicate.studentId})
        </strong>
        .{' '}
        <Link href={studentHref(duplicate.studentId)} className={styles.bannerLink}>
          Open the existing record
        </Link>{' '}
        instead of creating a duplicate.
      </p>
    </div>
  );
});

export default DuplicateBanner;
