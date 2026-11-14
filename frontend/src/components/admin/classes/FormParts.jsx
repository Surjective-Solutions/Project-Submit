import Icon from '@/components/admin/Icon';
import styles from './classes.module.css';
import s from './sessions.module.css';

// A labelled form field with an optional hint and an error line.
export function Field({ id, label, required, error, children, hint }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}{' '}
        {required && (
          <span className={styles.req} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className={s.hint}>{hint}</p>}
      {error && (
        <p className={s.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// A group of radio options drawn as cards.
export function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className={s.choiceSet}>
      <legend className={styles.label}>{legend}</legend>
      <div className={s.choices}>
        {options.map((option) => (
          <label key={option.value} className={`${s.choice} ${value === option.value ? s.choiceOn : ''}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={s.srOnly}
            />
            {option.icon && <Icon name={option.icon} size={20} weight={500} />}
            <span className={s.choiceText}>
              <span className={s.choiceLabel}>{option.label}</span>
              <span className={s.choiceHint}>{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// A select with the chevron the other dropdowns use.
export function SelectBox({ id, value, onChange, invalid, children }) {
  return (
    <div className={styles.selectWrap}>
      <select id={id} className={`${styles.select} ${invalid ? s.inputError : ''}`} value={value} onChange={onChange}>
        {children}
      </select>
      <span className={styles.selectIcon} aria-hidden="true">
        <Icon name="expand_more" size={22} weight={500} />
      </span>
    </div>
  );
}
