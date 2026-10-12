'use client';

import Icon from '@/components/admin/Icon';
import styles from './reports.module.css';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <Icon name="info" size={18} fill={1} />
      <span>{message}</span>
    </div>
  );
}
