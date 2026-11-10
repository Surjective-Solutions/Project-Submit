import Icon from '@/components/admin/Icon';
import { STATUS_META } from '@/attendance/constants';
import styles from './attendance.module.css';

// A status pill: icon and text, so the status never depends on colour alone.
export default function StatusChip({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <span className={`${styles.statusChip} ${styles.tone}`} data-status={status}>
      <Icon name={meta.icon} size={15} weight={600} fill={1} />
      {meta.label}
    </span>
  );
}
