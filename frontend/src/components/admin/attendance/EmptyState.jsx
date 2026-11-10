import Icon from '@/components/admin/Icon';
import styles from './attendance.module.css';

export default function EmptyState() {
  return (
    <section className={styles.empty} aria-label="No student selected">
      <span className={styles.emptyTile}>
        <Icon name="barcode_scanner" size={32} weight={500} />
      </span>
      <h2 className={styles.emptyTitle}>Enter barcode to begin</h2>
      <p className={styles.emptyText}>
        Student details, attendance on the chosen date, and the month-by-month record appear here.
      </p>
    </section>
  );
}
