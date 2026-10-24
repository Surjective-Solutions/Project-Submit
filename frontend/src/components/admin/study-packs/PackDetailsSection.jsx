'use client';

import { LIMITS } from '@/study-packs/constants';
import { ERROR_MESSAGES } from '@/study-packs/utils';
import FormSection, { Field } from './FormSection';
import styles from './study-packs.module.css';

export default function PackDetailsSection({ form, errors, onChange }) {
  return (
    <FormSection icon="edit_note" title="Pack details" subtitle="What students see in the store.">
      <div className={styles.fields}>
        <Field id="sp-name" label="Study pack name" required error={errors.name ? ERROR_MESSAGES.name : ''}>
          <input
            id="sp-name"
            type="text"
            className={errors.name ? `${styles.input} ${styles.inputInvalid}` : styles.input}
            value={form.name}
            maxLength={LIMITS.name}
            placeholder="e.g. Mechanics — Motion & Forces"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'sp-name-error' : undefined}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </Field>

        <Field
          id="sp-description"
          label="Description (optional)"
          aside={
            <span className={styles.counter}>
              {form.description.length} / {LIMITS.description}
            </span>
          }
        >
          <textarea
            id="sp-description"
            className= {styles.textarea}
            value={form.description}
            maxLength={LIMITS.description}
            rows={3}
            placeholder="Which lesson or unit does this cover, and who is it for?"
            onChange={(e) => onChange('description', e.target.value)}
          />
        </Field>
      </div>
    </FormSection>
  );
}
