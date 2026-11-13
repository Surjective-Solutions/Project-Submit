import Icon from '@/components/admin/Icon';
import { TYPE_META } from '@/classes/constants';
import { batchKey, classTitle, formatFee, scheduleText } from '@/classes/utils';
import styles from './classes.module.css';
import s from './sessions.module.css';

const TILES = [
  { key: 'total', label: 'Total enrollments', icon: 'groups', tone: 'navy' },
  { key: 'paidThisMonth', label: 'Paid for this month', icon: 'payments', tone: 'cyan' },
  { key: 'free', label: 'Free enrollments', icon: 'redeem', tone: 'yellow' },
];

// The class at the top of its page: what it is, the "Create session" button and the three enrollment numbers.
export default function ClassOverview({ cls, onCreateSession }) {
  const meta = TYPE_META[cls.type] || TYPE_META.Theory;
  return (
    <>
      <header className={s.overview}>
        <div className={s.overviewMain}>
          <span className={styles.typeChip} style={{ color: meta.color, background: meta.tint }}>
            <span className={styles.typeDot} style={{ background: meta.color }} aria-hidden="true" />
            {cls.type}
          </span>
          <h1 className={s.className}>{classTitle(cls, cls.tutor)}</h1>
          <p className={s.classLine}>
            {cls.tutor.name} · {batchKey(cls)} · {cls.medium} medium
          </p>
          <p className={s.classLine}>
            {scheduleText(cls)} · {formatFee(cls.monthlyFee)}
          </p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={onCreateSession}>
          <Icon name="add" size={20} weight={600} />
          Create session
        </button>
      </header>

      <dl className={s.stats} aria-label="Enrollments">
        {TILES.map((tile) => (
          <div key={tile.key} className={s.stat}>
            <span className={`${s.statIcon} ${s[`tone_${tile.tone}`]}`} aria-hidden="true">
              <Icon name={tile.icon} size={22} weight={500} />
            </span>
            <div className={s.statText}>
              <dt className={s.statLabel}>{tile.label}</dt>
              <dd className={s.statValue}>{cls.enrollments[tile.key]}</dd>
            </div>
          </div>
        ))}
      </dl>
    </>
  );
}
