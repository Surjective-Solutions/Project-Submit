import Icon from '@/components/admin/Icon';
import styles from './registration.module.css';

// A form card: icon tile, title, subtitle and a Required / Optional tag.
export default function SectionCard({ id, icon, title, subtitle, required = true, children }) {
  return (
    <section className={styles.card} aria-labelledby={`${id}-title`}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon name={icon} size={19} />
        </span>
        <div className={styles.cardTitles}>
          <h2 id={`${id}-title`} className={styles.cardTitle}>
            {title}
          </h2>
          <p className={styles.cardSub}>{subtitle}</p>
        </div>
        {required !== null && (
          <span className={required ? styles.tagRequired : styles.tagOptional}>{required ? 'Required' : 'Optional'}</span>
        )}
      </header>
      {children}
    </section>
  );
}
