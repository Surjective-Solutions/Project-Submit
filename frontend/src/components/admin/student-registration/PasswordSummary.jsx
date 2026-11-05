import Icon from '@/components/admin/Icon';
import Avatar from './Avatar';
import styles from './registration.module.css';
import flow from './flow.module.css';

// Aside of the Set Password page: who the account is for, plus a way back to the details.
export default function PasswordSummary({ summary, photoUrl, onEdit }) {
  const rows = [
    ['Sign-in username', summary.phone],
    ['Guardian', summary.guardian],
    ['Grade · stream', summary.gradeStream],
  ];

  return (
    <aside className={styles.aside} aria-label="Account summary">
      <div className={styles.card}>
        <div className={styles.summaryHead}>
          <Avatar photo={photoUrl} initials={summary.initials} size={52} className={styles.summaryAvatar} />
          <div className={styles.summaryWho}>
            <p className={styles.summaryName}>{summary.name}</p>
            <p className={styles.summaryId}>
              <span className={styles.srOnly}>Student ID </span>
              {summary.studentId}
            </p>
          </div>
        </div>

        <dl className={flow.sumRows}>
          {rows.map(([label, value]) => (
            <div key={label} className={flow.sumRow}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <button type="button" className={`${styles.secondaryButton} ${flow.fullWidth}`} onClick={onEdit}>
          <Icon name="edit" size={18} />
          Edit details
        </button>
      </div>

      <div className={styles.note}>
        <Icon name="shield_lock" size={20} style={{ color: '#223385' }} />
        <p>
          Share the password with the student in person. It is never sent by SMS. The student can change it after their first sign-in.
        </p>
      </div>
    </aside>
  );
}
