import Icon from '@/components/admin/Icon';
import styles from './registration.module.css';

export default function SameAsCheckbox({ id, checked, onChange }) {
  return (
    <label htmlFor={id} className={styles.checkRow}>
      <input id={id} type="checkbox" className={styles.checkInput} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.checkBox} aria-hidden="true">
        <Icon name="check" size={16} weight={700} />
      </span>
      <span className={styles.checkLabel}>WhatsApp number is the same as the contact number</span>
    </label>
  );
}
