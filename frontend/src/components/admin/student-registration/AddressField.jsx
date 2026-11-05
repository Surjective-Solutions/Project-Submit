import styles from './registration.module.css';

export default function AddressField({ id, value, onChange, error, hint }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={`${styles.field} ${styles.fullRow}`}>
      <label htmlFor={id} className={styles.label}>
        Address
        <span className={styles.req} aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      <div className={`${styles.inputWrap} ${styles.textareaWrap} ${error ? styles.inputError : ''}`}>
        <textarea
          id={id}
          className={styles.textarea}
          rows={2}
          maxLength={200}
          placeholder="No. 42/1, Peradeniya Road, Kandy"
          autoComplete="street-address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hintId}
        />
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
