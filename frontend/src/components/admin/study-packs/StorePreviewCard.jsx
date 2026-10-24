'use client';

import Icon from '@/components/admin/Icon';
import { formatLkr, teacherName, toNumber, validityLabel } from '@/study-packs/utils';
import PackCover from './PackCover';
import styles from './study-packs.module.css';

// Live preview of the pack as a student would see it in the store.
export default function StorePreviewCard({ form, teachers }) {
  const name = form.name.trim();
  const description = form.description.trim();
  const teacher = teacherName(teachers, form.teacherId);
  const byline = [teacher, form.subject].filter(Boolean).join(' · ');

  return (
    <div className={styles.previewBlock}>
      <span className={styles.previewLabel}>STUDENT STORE PREVIEW</span>

      <article className={styles.storeCard}>
        <PackCover coverUrl={form.coverUrl} subject={form.subject} grade={form.grade} />

        <div className={styles.storeBody}>
          <h3 className={name ? styles.storeName : `${styles.storeName} ${styles.placeholder}`}>
            {name || 'Study pack name'}
          </h3>
          <p className={byline ? styles.storeByline : `${styles.storeByline} ${styles.placeholder}`}>
            {byline || 'Teacher · Subject'}
          </p>
          <p className={description ? styles.storeDescription : `${styles.storeDescription} ${styles.placeholder}`}>
            {description || 'Your description will appear here.'}
          </p>
          <p className={styles.storeFact}>
            <Icon name="schedule" size={17} />
            <span>{validityLabel(form.validity, form.customDays)}</span>
          </p>
        </div>

        <div className={styles.storeFooter}>
          <span className={styles.storePrice}>{formatLkr(toNumber(form.price))}</span>
          <span className={styles.buyButton} aria-hidden="true">
            Buy pack
          </span>
        </div>
      </article>
    </div>
  );
}
