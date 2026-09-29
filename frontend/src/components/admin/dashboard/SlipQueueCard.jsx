'use client';

import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import {formatNumber, formatWait } from './format';
import styles from './dashboard.module.css';

const VISIBLE_SLIPS = 5;
// Slips older than this get the "waiting" emphasis.
const LONG_WAIT_MINUTES = 120;

export default function SlipQueueCard() {
  const { slips } = useAdminConsole();
  const visible = slips.slice(0, VISIBLE_SLIPS);

  return (
    <section id="slip-queue" className={`${styles.card} ${styles.slipsCard}`} aria-labelledby="slip-queue-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="slip-queue-title" className={styles.cardTitle}>
            Bank slip verification
          </h2>
          <p className={styles.cardSub}>Oldest first · approving activates the student&apos;s pass</p>
        </div>
        {slips.length > 0 && <span className={styles.waitingChip}>{formatNumber(slips.length)} waiting</span>}
      </div>

      {slips.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon name="task_alt" size={32} style={{ color: 'var(--syz-cyan-dark)' }} />
          <strong>All slips verified</strong>
          <span>New uploads will appear here.</span>
        </div>
      ) : (
        <>
          <ul className={styles.slipList}>
            {visible.map((slip, index) => {
              return (
                <li key={slip.id} className={styles.slipRow}>
                  <span className={styles.slipThumb} aria-hidden="true">
                    <Icon name="receipt_long" size={18} />
                  </span>
                  <div className={styles.slipBody}>
                    <span className={styles.slipName}>{slip.name}</span>
                    <span className={styles.slipMeta}>
                      {slip.studentId} · {slip.pass}
                    </span>
                    <span className={styles.slipMeta}>
                      {slip.bank} ·{' '}
                      <span className={slip.waitingMinutes >= LONG_WAIT_MINUTES ? styles.waitLong : undefined}>
                        waiting {formatWait(slip.waitingMinutes)}
                      </span>
                    </span>
                  </div>
                  <div className={styles.slipAmount}>
                    <small>LKR</small>
                    {formatNumber(slip.amount)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={styles.slipFooter}>
            <span>
              Showing {visible.length} of {formatNumber(slips.length)}
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
