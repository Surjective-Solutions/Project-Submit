import styles from './registration.module.css';

// Label + input with an optional prefix ("+94"), hint and error. `id` is also what the page
// focuses when a submit fails, so it is always "reg-<fieldName>".
export default function TextField({
  id,
  label,
  required = false,
  hint,
  error,
  prefix,
  className = '',
  ...inputProps
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.req} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={id}
          className={styles.input}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
