'use client';

import Icon from '@/components/admin/Icon';
import styles from './staff.module.css';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status">
      <Icon name="check_circle" size={18} style={{ color: '#0B4F6E' }} />
      <span>{message}</span>
    </div>
  );
}