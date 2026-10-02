import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { STUDY_PACK_STAGES } from './dashboard-data';
import { formatNumber, percent } from './format';
import styles from './dashboard.module.css';

// studentsByStream is a useDashboardData section: { data: { total, streams }, loading, error }
export function StudentsByStreamCard({ studentsByStream }) {
  const total = studentsByStream.data?.total ?? 0;
  const streams = studentsByStream.data?.streams ?? [];
  const max = Math.max(0, ...streams.map((s) => s.count));

  return (
    <section className={`${styles.card} ${styles.streamCard}`} aria-labelledby="stream-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="stream-title" className={styles.cardTitle}>
            Students by stream
          </h2>
          <p className={styles.cardSub}>
            {studentsByStream.data
              ? `${formatNumber(total)} active students`
              : studentsByStream.error
                ? "Couldn't load stream figures"
                : 'Loading…'}
          </p>
        </div>
      </div>

      {studentsByStream.data && streams.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon name="school" size={32} style={{ color: 'var(--syz-cyan-dark)' }} />
          <strong>No active students yet</strong>
          <span>Approved sign-ups will appear here by stream.</span>
        </div>
      ) : (
        <ul className={styles.streamList}>
          {streams.map(({ stream, count }) => (
            <li key={stream} className={styles.streamRow}>
              <span className={styles.streamName} title={stream}>
                {stream}
              </span>
              <span className={styles.streamTrack} aria-hidden="true">
                <span className={styles.streamFill} style={{ width: `${max ? (count / max) * 100 : 0}%` }} />
              </span>
              <span className={styles.streamValue}>
                {formatNumber(count)}
                <span>{percent(count, total)}%</span>
              </span>
            </li>
          ))}
        </ul>
      )}

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
