import Icon from '@/components/admin/Icon';
import { formatPhone, initialsOf } from '@/attendance/utils';
import styles from './attendance.module.css';

function InfoRow({ icon, label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.iconTile} aria-hidden="true">
        <Icon name={icon} size={19} weight={500} />
      </span>
      <div className={styles.infoText}>
        <dt className={styles.infoLabel}>{label}</dt>
        <dd className={styles.infoValue}>{value || '–'}</dd>
      </div>
    </div>
  );
}

export default function StudentCard({ student }) {
  return (
    <section className={`${styles.card} ${styles.studentCol}`} aria-label="Student details">
      <div className={styles.studentHead}>
        <span className={styles.avatar} aria-hidden="true">
          {student.initials || initialsOf(student.name)}
        </span>
        <div className={styles.studentTitle}>
          <h2 className={styles.studentName}>{student.name}</h2>
          <div className={styles.studentMeta}>
            <span className={`${styles.mono} ${styles.studentId}`}>{student.id}</span>
            <span className={styles.activeChip}>Active</span>
          </div>
        </div>
      </div>
      <dl className={styles.infoList}>
        <InfoRow icon="school" label="Grade" value={student.grade} />
        <InfoRow icon="call" label="Phone number" value={formatPhone(student.phone)} />
        <InfoRow icon="home" label="Address" value={student.address} />
      </dl>
    </section>
  );
}
