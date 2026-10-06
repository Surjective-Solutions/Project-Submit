'use client';

import Icon from '@/components/admin/Icon';
import styles from './staff.module.css';

export default function CategoryCard({ category, count, active, onClick }) {
  return (
    <button
      type="button"
      className={active ? `${styles.categoryCard} ${styles.categoryCardActive}` : styles.categoryCard}
      onClick={onClick}
    >
      <span
        className={
          active ? `${styles.categoryIconTile} ${styles.categoryIconTileActive}` : styles.categoryIconTile
        }
      >
        <Icon name={category.icon} size={22} fill={active} />
      </span>
      <span className={styles.categoryText}>
        <span className={styles.categoryTopRow}>
          <span className={styles.categoryLabel}>{category.label}</span>
          {active && <span className={styles.categoryDot} aria-hidden="true" />}
        </span>
        <span className={styles.categoryCountRow}>
          <span className={styles.categoryCount}>{count}</span>
          <span className={styles.activePill}>
            <span className={styles.activePillDot} aria-hidden="true" />
            Active
          </span>
        </span>
      </span>
    </button>
  );
}