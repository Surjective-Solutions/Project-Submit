'use client';

import Icon from '@/components/admin/Icon';
import styles from './study-packs.module.css';

// Sits under the page title; the page clears it after a few seconds.
export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <Icon name="check_circle" size={20} fill={1} />
      <span>{message}</span>
    </div>
  );
}
