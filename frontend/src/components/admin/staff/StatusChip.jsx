'use client';

import styles from './staff.module.css';

const STATUS_STYLES = {
  Active: { bg: '#B8FF8F', color: '#053A34', dot: '#115827' },
  Inactive: { bg: '#F7CDA5', color: '#053A34', dot: '#ba2c2c' },
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