'use client';

import { LIMITS, VALIDITY_OPTIONS } from '@/study-packs/constants';
import { digitsOnly, ERROR_MESSAGES, formatThousands, validityHint } from '@/study-packs/utils';
import FormSection, { Field } from './FormSection';
import styles from './study-packs.module.css';

export default function PriceValiditySection({ form, errors, onChange }) {
  return (
    <FormSection icon="sell" title="Price & validity" subtitle="What students pay, and how long they keep access.">
      <div className={styles.fields}>
        <Field id="sp-price" label="Price" required error={errors.price ? ERROR_MESSAGES.price : ''}>
          <div className={styles.priceWrap}>
            <span className={styles.pricePrefix} aria-hidden="true">
              LKR
            </span>
            <input
              id="sp-price"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={errors.price ? `${styles.input} ${styles.priceInput} ${styles.inputInvalid}` : `${styles.input} ${styles.priceInput}`}
              value={formatThousands(form.price)}
              placeholder="0"
              aria-invalid={errors.price ? 'true' : undefined}
              aria-describedby={errors.price ? 'sp-price-error' : undefined}
              onChange={(e) => onChange('price', digitsOnly(e.target.value, LIMITS.priceDigits))}
            />
          </div>
        </Field>

        <div className={styles.field}>
          <span className={styles.label} id="sp-validity-label">
            Validity<span className={styles.req}> *</span>
          </span>
          <div className={styles.segmented} role="radiogroup" aria-labelledby="sp-validity-label">
            {VALIDITY_OPTIONS.map((option) => {
              const active = option.value === form.validity;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? `${styles.segment} ${styles.segmentActive}` : styles.segment}
                  onClick={() => onChange('validity', option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {form.validity === 'custom' ? (
            <div className={styles.customDays}>
              <input
                id="sp-custom-days"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label="Number of days"
                className={errors.validity ? `${styles.input} ${styles.daysInput} ${styles.inputInvalid}` : `${styles.input} ${styles.daysInput}`}
                value={form.customDays}
                placeholder="90"
                aria-invalid={errors.validity ? 'true' : undefined}
                aria-describedby={errors.validity ? 'sp-custom-days-error' : undefined}
                onChange={(e) => onChange('customDays', digitsOnly(e.target.value, LIMITS.customDaysDigits))}
              />
              <span className={styles.customDaysText}>days from purchase</span>
            </div>
          ) : null}

          {errors.validity ? (
            <p id="sp-custom-days-error" className={styles.errorText}>
              {ERROR_MESSAGES.validity}
            </p>
          ) : (
            <p className={styles.hint}>{validityHint(form.validity)}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}
