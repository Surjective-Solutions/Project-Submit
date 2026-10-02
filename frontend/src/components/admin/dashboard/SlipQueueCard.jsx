'use client';

import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { formatNumber, formatWait } from './format';
import styles from './dashboard.module.css';

// Slips older than this get the "waiting" emphasis.
const LONG_WAIT_MINUTES = 120;

const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short' });

// month is 1-based from the API: 10 → "Oct"
const monthLabel = (month) => monthFormat.format(new Date(2000, month - 1, 1));

function QueueMessage({ icon, title, children }) {
  return (
    <div className={styles.emptyState}>
      <Icon name={icon} size={32} style={{ color: 'var(--syz-cyan-dark)' }} />
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}

// slipQueue is a useDashboardData section: { data: { total, slips }, loading, error }
export default function SlipQueueCard({ slipQueue }) {
  const total = slipQueue.data?.total ?? 0;
  const slips = slipQueue.data?.slips ?? [];

  return (
    <section id="slip-queue" className={`${styles.card} ${styles.slipsCard}`} aria-labelledby="slip-queue-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="slip-queue-title" className={styles.cardTitle}>
            Bank slip verification
          </h2>
          <p className={styles.cardSub}>Oldest first · approving activates the student&apos;s pass</p>
        </div>
        {total > 0 && <span className={styles.waitingChip}>{formatNumber(total)} waiting</span>}
      </div>

      {slipQueue.error ? (
        <QueueMessage icon="error" title="Couldn't load the slip queue">
          Refresh the page to try again.
        </QueueMessage>
      ) : !slipQueue.data ? (
        <QueueMessage icon="hourglass_empty" title="Loading…">
          Fetching slips waiting for review.
        </QueueMessage>
      ) : slips.length === 0 ? (
        <QueueMessage icon="task_alt" title="All slips verified">
          New uploads will appear here.
        </QueueMessage>
      ) : (
        <>
          <ul className={styles.slipList}>
            {slips.map((slip) => (
              <li key={slip.id} className={styles.slipRow}>
                <span className={styles.slipThumb} aria-hidden="true">
                  <Icon name="receipt_long" size={18} />
                </span>
                <div className={styles.slipBody}>
                  <span className={styles.slipName}>{slip.studentName}</span>
                  <span className={styles.slipMeta}>
                    {slip.studentNo ? `${slip.studentNo} · ` : ''}
                    {slip.className} · {monthLabel(slip.month)}
                  </span>
                  <span className={styles.slipMeta}>
                    {slip.tutorName ? `${slip.tutorName} · ` : ''}
                    <span className={slip.waitingMinutes >= LONG_WAIT_MINUTES ? styles.waitLong : undefined}>
                      waiting {formatWait(slip.waitingMinutes)}
                    </span>
                  </span>
                </div>
                <div className={styles.slipAmount}>
                  <small>LKR</small>
                  {formatNumber(slip.amount ?? 0)}
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.slipFooter}>
            <span>
              Showing {slips.length} of {formatNumber(total)}
            </span>
            <Link href="/admin/payments" className={styles.textLink}>
              Open payments
              <Icon name="arrow_forward" size={17} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
