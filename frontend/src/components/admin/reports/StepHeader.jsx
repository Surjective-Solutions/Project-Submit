'use client';

import Icon from '@/components/admin/Icon';
import styles from './reports.module.css';

// state: 'idle' | 'current' | 'done'
export default function StepHeader({ number, title, subtitle, state, right }) {
  const badgeClass = [
    styles.stepBadge,
    state === 'current' ? styles.stepBadgeCurrent : '',
    state === 'done' ? styles.stepBadgeDone : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.stepHeader}>
      <span className={badgeClass} aria-hidden="true">
        {state === 'done' ? <Icon name="check" size={16} weight={700} /> : number}
      </span>
      <div className={styles.stepText}>
        <span className={styles.stepTitle}>
          <span className={styles.srOnly}>{`Step ${number}: `}</span>
          {title}
        </span>
        {subtitle ? <span className={styles.stepSubtitle}>{subtitle}</span> : null}
      </div>
      {right ? <div className={styles.stepRight}>{right}</div> : null}
    </div>
  );
}
