'use client';

import { LIMITS } from '@/study-packs/constants';
import { digitsOnly, formatLkr, shareAmount } from '@/study-packs/utils';
import styles from './study-packs.module.css';

// One party's percentage, with what that works out to per sale underneath.
export default function RevenueShareInput({ part, value, price, onChange }) {
  const id = `sp-share-${part.key}`;
  const percent = Number(value) || 0;

  return (
    <div className={styles.shareItem}>
      <label htmlFor={id} className={styles.shareLabel}>
        <span className={styles.shareDot} style={{ background: part.color }} aria-hidden="true" />
        {part.label}
      </label>
      <div className={styles.shareInputWrap}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(part.key, digitsOnly(e.target.value, LIMITS.shareDigits))}
        />
        <span className={styles.percentSuffix} aria-hidden="true">
          %
        </span>
      </div>
      <span className={styles.shareAmount}>
        {price > 0 ? `${formatLkr(shareAmount(price, percent))} per sale` : 'Set a price to see the amount'}
      </span>
    </div>
  );
}
