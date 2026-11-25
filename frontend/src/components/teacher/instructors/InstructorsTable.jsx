'use client';

import { useEffect, useRef } from 'react';
import { formatAdded, initials, plural } from '@/instructors/utils';
import { UserCheckIcon } from './icons';
import styles from './instructors.module.css';

// "Your instructors". A row's Remove asks "Keep / Remove" in place before anything is removed.
function Row({ instructor, classCount, fresh, confirming, busy, onAsk, onKeep, onRemove }) {
  const keepButton = useRef(null);
  useEffect(() => {
    if (confirming) keepButton.current?.focus(); // keyboard users land on the safe choice
  }, [confirming]);

  return (
    <tr className={fresh ? `${styles.row} ${styles.rowFresh}` : styles.row}>
      <td>
        <div className={styles.person}>
          <span className={styles.avatar} aria-hidden="true">{initials(instructor.name)}</span>
          <div className={styles.personText}>
            <p className={styles.personName}>{instructor.name}</p>
            <p className={styles.mono}>{instructor.id}</p>
          </div>
        </div>
      </td>
      <td className={styles.cellEmail}>{instructor.email}</td>
      <td>
        <span className={styles.accessChip}>All classes · {classCount}</span>
      </td>
      <td className={styles.cellMuted}>{formatAdded(instructor.addedAt)}</td>
      <td className={styles.cellMuted}>{instructor.lastActive}</td>
      <td className={styles.cellActions}>
        {confirming ? (
          <div className={styles.confirm} role="group" aria-label={`Remove ${instructor.name}?`}>
            <button
              ref={keepButton}
              type="button"
              className={styles.btnSecondarySm}
              onClick={() => onKeep(instructor)}
              disabled={busy}
              aria-label={`Keep ${instructor.name}`}
            >
              Keep
            </button>
            <button
              type="button"
              className={styles.btnDangerSolid}
              onClick={() => onRemove(instructor)}
              disabled={busy}
              aria-label={`Confirm: remove ${instructor.name}`}
            >
              {busy ? 'Removing…' : 'Remove'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => onAsk(instructor)}
            aria-label={`Remove ${instructor.name}`}
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}

export default function InstructorsTable({
  status,
  error,
  instructors,
  classCount,
  freshId,
  confirmId,
  busyId,
  headingRef,
  onRetry,
  onAsk,
  onKeep,
  onRemove,
}) {
  let body;
  if (status === 'loading') {
    body = <div className={styles.state}>Loading instructors…</div>;
  } else if (status === 'error') {
    body = (
      <div className={styles.state}>
        <p className={styles.stateText}>{error}</p>
        <button type="button" className={styles.btnSecondary} onClick={onRetry}>Try again</button>
      </div>
    );
  } else if (instructors.length === 0) {
    body = (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}><UserCheckIcon size={26} /></span>
        <p className={styles.emptyTitle}>No instructors yet</p>
        <p className={styles.stateText}>Add an instructor with their Instructor ID to let them help run your classes.</p>
      </div>
    );
  } else {
    body = (
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Instructor</th>
              <th scope="col">Email</th>
              <th scope="col" className={styles.colAccess}>Access</th>
              <th scope="col">Added</th>
              <th scope="col">Last active</th>
              <th scope="col"><span className={styles.srOnly}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <Row
                key={instructor.id}
                instructor={instructor}
                classCount={classCount}
                fresh={instructor.id === freshId}
                confirming={instructor.id === confirmId}
                busy={instructor.id === busyId}
                onAsk={onAsk}
                onKeep={onKeep}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className={`${styles.card} ${styles.tableCard}`} aria-labelledby="ins-list-title">
      <div className={styles.tableHead}>
        <h2 id="ins-list-title" ref={headingRef} tabIndex={-1} className={styles.cardTitle}>Your instructors</h2>
        {status === 'ready' ? <span className={styles.countChip}>{instructors.length} active</span> : null}
      </div>
      {body}
    </section>
  );
}
