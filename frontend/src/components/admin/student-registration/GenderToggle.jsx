import { GENDERS } from '@/student-registration/constants';
import styles from './registration.module.css';

// Two-option segmented control built on real radio inputs, so keyboard and screen readers work natively.
// The wrapper takes focus (tabIndex -1) when the page jumps to a missing gender after a failed submit.
export default function GenderToggle({ id, value, onChange, error }) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <span id={`${id}-label`} className={styles.label}>
        Gender
        <span className={styles.req} aria-hidden="true">
          {' '}
          *
        </span>
      </span>
      <div
        id={id}
        tabIndex={-1}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${styles.segmented} ${error ? styles.segmentedError : ''}`}
      >
        {GENDERS.map((gender) => (
          <label key={gender} className={styles.segment}>
            <input
              type="radio"
              name="gender"
              value={gender}
              checked={value === gender}
              onChange={() => onChange(gender)}
              className={styles.segmentInput}
            />
            <span className={styles.segmentFace}>{gender}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
