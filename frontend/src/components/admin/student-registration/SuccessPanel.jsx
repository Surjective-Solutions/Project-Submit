import { forwardRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { STREAMS } from '@/student-registration/constants';
import { fullName, formatDob, formatPhoneLocal, gradeLabel, initialsOf, isOrdinaryLevel, normalizePhone, studentHref } from '@/student-registration/utils';
import Avatar from './Avatar';
import styles from './registration.module.css';

// Replaces the form after a successful registration. `result` = { studentId, form, photoUrl }.
const SuccessPanel = forwardRef(function SuccessPanel({ result, onRegisterAnother }, ref) {
  const { studentId, form, photoUrl } = result;
  const name = fullName(form);

  const grade = gradeLabel(form.grade);
  const stream = !isOrdinaryLevel(form.grade) && STREAMS.some((s) => s.value === form.stream) ? form.stream : '';
  const gradeStream = grade ? [grade, stream].filter(Boolean).join(' · ') : 'Not set';

  const rows = [
    ['Student ID', <span key="id" className={styles.mono}>{studentId}</span>],
    ['Contact number', formatPhoneLocal(form.contactNumber)],
    ['Date of birth', formatDob(form.dateOfBirth)],
    ['Guardian', `${form.guardianName.trim()} · ${formatPhoneLocal(form.guardianContact)}`],
    ['Grade · stream', gradeStream],
    ['District', form.district || 'Not set'],
  ];

  return (
    <section className={`${styles.card} ${styles.success}`} aria-labelledby="registration-success-title">
      <div className={styles.successAvatar}>
        <Avatar photo={photoUrl} initials={initialsOf(form)} size={84} className={styles.successAvatarCircle} />
        <span className={styles.successBadge} aria-hidden="true">
          <Icon name="check" size={16} weight={700} />
        </span>
      </div>

      <div className={styles.successText}>
        <h2 id="registration-success-title" ref={ref} tabIndex={-1} className={styles.successTitle}>
          {name} is registered
        </h2>
        <p className={styles.successSub}>Login details were sent by SMS to +94 {normalizePhone(form.contactNumber)}.</p>
      </div>

      <dl className={styles.detailsBox}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.detailsRow}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.successActions}>
        <Link href={studentHref(studentId)} className={styles.secondaryButton}>
          <Icon name="person_search" size={19} />
          View student
        </Link>
        <button type="button" className={styles.primaryButton} onClick={onRegisterAnother}>
          <Icon name="person_add" size={20} weight={600} />
          Register another
        </button>
      </div>
    </section>
  );
});

export default SuccessPanel;
