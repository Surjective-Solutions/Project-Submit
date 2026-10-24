'use client';

import Icon from '@/components/admin/Icon';
import { SHARE_PARTS } from '@/study-packs/constants';
import { toNumber } from '@/study-packs/utils';
import FormSection from './FormSection';
import RevenueShareInput from './RevenueShareInput';
import styles from './study-packs.module.css';

export default function RevenueShareSection({ form, price, total, onShareChange }) {
  const balanced = total === 100;
  // The bar never runs past full width, even when the shares add up to more than 100.
  const scale = Math.max(total, 100);

  return (
    <FormSection icon="pie_chart" title="Revenue share" subtitle="How each sale is split. The three must total 100%.">
      <div className={styles.shareGrid}>
        {SHARE_PARTS.map((part) => (
          <RevenueShareInput
            key={part.key}
            part={part}
            value={form.shares[part.key]}
            price={price}
            onChange={onShareChange}
          />
        ))}
      </div>

      <div className={styles.shareBar} role="img" aria-label="Revenue split">
        {SHARE_PARTS.map((part) => (
          <span
            key={part.key}
            className={styles.shareSegment}
            style={{ width: `${(toNumber(form.shares[part.key]) / scale) * 100}%`, background: part.color }}
          />
        ))}
      </div>

      <div className={styles.totalRow}>
        <span
          className={balanced ? `${styles.totalBadge} ${styles.totalOk}` : `${styles.totalBadge} ${styles.totalBad}`}
          role="status"
        >
          <Icon name={balanced ? 'check_circle' : 'error'} size={17} fill={1} />
          Total {total}%
        </span>
        {!balanced ? <span className={styles.totalHint}>The shares must add up to exactly 100%.</span> : null}
      </div>
    </FormSection>
  );
}
