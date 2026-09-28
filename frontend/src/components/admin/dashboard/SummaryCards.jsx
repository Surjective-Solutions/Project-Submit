import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { STUDENTS_BY_STREAM, STUDY_PACK_STAGES } from './dashboard-data';
import { formatNumber, percent } from './format';
import styles from './dashboard.module.css';

export function StudentsByStreamCard() {
  const total = STUDENTS_BY_STREAM.reduce((sum, s) => sum + s.count, 0);
  const max = Math.max(...STUDENTS_BY_STREAM.map((s) => s.count));

  return (
    <section className={`${styles.card} ${styles.streamCard}`} aria-labelledby="stream-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="stream-title" className={styles.cardTitle}>
            Students by stream
          </h2>
          <p className={styles.cardSub}>{formatNumber(total)} active students</p>
        </div>
      </div>

      <ul className={styles.streamList}>
        {STUDENTS_BY_STREAM.map(({ stream, count }) => (
          <li key={stream} className={styles.streamRow}>
            <span className={styles.streamName} title={stream}>
              {stream}
            </span>
            <span className={styles.streamTrack} aria-hidden="true">
              <span className={styles.streamFill} style={{ width:`${(count / max) * 100}%` }} />
            </span>
            <span className={styles.streamValue}>
              {formatNumber(count)}
              <span>{percent(count, total)}%</span>
            </span>
          </li>
        ))}
      </ul>

      <Link href="/admin/reports" className={`${styles.textLink} ${styles.cardFooterLink}`}>
        Enrolment reports
        <Icon name="arrow_forward" size={17} />
      </Link>
    </section>
  );
}

export function StudyPacksCard() {
  return (
    <section className={`${styles.card} ${styles.packsCard}`} aria-labelledby="packs-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="packs-title" className={styles.cardTitle}>
            October study packs
          </h2>
          <p className={styles.cardSub}>Courier dispatch</p>
        </div>
      </div>

      <ul className={styles.packList}>
        {STUDY_PACK_STAGES.map(({ key, label, note, count, icon, tone }) => (
          <li key={key} className={`${styles.packRow} ${styles[`tone_${tone}`]}`}>
            <span className={styles.packTile} aria-hidden="true">
              <Icon name={icon} size={19} />
            </span>
            <span className={styles.packText}>
              <span className={styles.packLabel}>{label}</span>
              <span className={styles.packNote}>{note}</span>
            </span>
            <span className={styles.packCount}>{formatNumber(count)}</span>
          </li>
        ))}
      </ul>

      <Link href="/admin/study-packs" className={`${styles.textLink} ${styles.cardFooterLink}`}>
        Manage study packs
        <Icon name="arrow_forward" size={17} />
      </Link>
    </section>
  );
}
