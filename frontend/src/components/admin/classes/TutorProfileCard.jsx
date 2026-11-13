import Icon from '@/components/admin/Icon';
import { formatPhone } from '@/classes/utils';
import Avatar from './Avatar';
import LevelTag from './LevelTag';
import styles from './classes.module.css';

// The tutor's photo, details and numbers, with the Create class button (pre-selects this tutor).
export default function TutorProfileCard({ tutor, stats, onCreate }) {
  const meta = [
    { icon: 'translate', label: 'Mediums', text: (tutor.mediums || []).join(', ') },
    { icon: 'call', label: 'Phone', text: formatPhone(tutor.phone) },
  ].filter((item) => item.text);

  return (
    <section className={styles.profileCard} aria-label="Tutor profile">
      <Avatar name={tutor.name} photoUrl={tutor.photoUrl} size={112} profile />

      <div className={styles.profileMain}>
        <div className={styles.profileNameRow}>
          <h1 className={styles.profileName}>{tutor.name}</h1>
          <LevelTag level={tutor.level} />
        </div>
        <p className={styles.profileSubject}>
          {tutor.subject} · {tutor.level}
        </p>
        <ul className={styles.profileMeta}>
          {meta.map((item) => (
            <li key={item.icon} aria-label={`${item.label}: ${item.text}`}>
              <Icon name={item.icon} size={18} weight={500} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.profileSide}>
        <dl className={styles.tiles}>
          {[
            ['Classes', stats.classes],
            ['Students', stats.students],
          ].map(([label, value]) => (
            <div key={label} className={styles.tile}>
              <dt className={styles.tileLabel}>{label}</dt>
              <dd className={styles.tileValue}>{value}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className={styles.primaryButton} onClick={onCreate}>
          <Icon name="add" size={20} weight={600} />
          Create class
        </button>
      </div>
    </section>
  );
}
