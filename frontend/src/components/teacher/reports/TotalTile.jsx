'use client';

import styles from './reports.module.css';

export default function TotalTile({ label, value }) {
  return (
    <div className={styles.totalTile}>
      <span className={styles.totalLabel}>{label}</span>
      <span className={styles.totalValue}>{value}</span>
    </div>
  );
}
