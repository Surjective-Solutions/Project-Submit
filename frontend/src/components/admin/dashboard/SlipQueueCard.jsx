'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import { formatLKR, formatNumber, formatWait } from './format';
import styles from './dashboard.module.css';

const VISIBLE_SLIPS = 5;
// Slips older than this get the "waiting" emphasis.
const LONG_WAIT_MINUTES = 120;

export default function SlipQueueCard() {
  const { slips, approveSlip, rejectSlip } = useAdminConsole();
  const visible = slips.slice(0, VISIBLE_SLIPS);
  const listRef = useRef(null);
  const headingRef = useRef(null);
  const pendingFocus = useRef(null);

  function resolve(slip, action, index) {
    pendingFocus.current = { action, index };
    if (action === 'approve') approveSlip(slip.id);
    else rejectSlip(slip.id);
  }

  // The clicked row disappears, so hand keyboard focus to the same button on
  // the row that slides into its place (or the heading once the queue is empty).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const buttons = listRef.current?.querySelectorAll(`[data-action="${target.action}"]`) ?? [];
    const next = buttons[Math.min(target.index, buttons.length - 1)];
    (next ?? headingRef.current)?.focus();
  }, [slips]);

  return (
    <section id="slip-queue" className={`${styles.card} ${styles.slipsCard}`} aria-labelledby="slip-queue-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="slip-queue-title" ref={headingRef} tabIndex={-1} className={styles.cardTitle}>
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
          <ul className={styles.slipList} ref={listRef}>
            {visible.map((slip, index) => {
              const summary = `${slip.name}, ${formatLKR(slip.amount)}`;
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
                  <div className={styles.slipActions}>
                    <button
                      type="button"
                      className={`${styles.slipButton} ${styles.approve}`}
                      aria-label={`Approve slip: ${summary}`}
                      title="Approve"
                      data-action="approve"
                      onClick={() => resolve(slip, 'approve', index)}
                    >
                      <Icon name="check" size={20} weight={600} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.slipButton} ${styles.reject}`}
                      aria-label={`Reject slip: ${summary}`}
                      title="Reject"
                      data-action="reject"
                      onClick={() => resolve(slip, 'reject', index)}
                    >
                      <Icon name="close" size={20} weight={600} />
                    </button>
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
