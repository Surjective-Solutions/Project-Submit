'use client';

import styles from './staff.module.css';

const STATUS_STYLES = {
  Active: { bg: '#E4F5FC', color: '#0B4F6E', dot: '#08A5E1' },
  Inactive: { bg: '#F1F3F7', color: '#5B6178', dot: '#9AA0B4' },
};

export default function StatusChip({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Inactive;
  return (
    <span className={styles.statusChip} style={{ background: style.bg, color: style.color }}>
      {style.dot && <span className={styles.statusDot} style={{ background: style.dot }} />}
      {status}
    </span>
  );
}