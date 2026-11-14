import Icon from '@/components/admin/Icon';
import { TYPE_META } from '@/classes/constants';
import { effectivePrice, priceText } from '@/classes/classUtils';
import { batchKey, classTitle, formatLkr, scheduleText } from '@/classes/utils';
import styles from './classes.module.css';
import s from './sessions.module.css';

const TILES = [
  { key: 'total', label: 'Total enrollments', icon: 'groups', tone: 'navy' },
  { key: 'paidThisMonth', label: 'Paid for this month', icon: 'payments', tone: 'cyan' },
  { key: 'free', label: 'Free enrollments', icon: 'redeem', tone: 'yellow' },
];

const OPTIONS = [
  { key: 'edit', label: 'Edit', icon: 'edit' },
  { key: 'notices', label: 'Notices', icon: 'campaign' },
  { key: 'students', label: 'Manage students', icon: 'manage_accounts' },
  { key: 'analytics', label: 'Analytics', icon: 'monitoring' },
];

// The class at the top of its page: what it is, the "Create session" button, the options (Edit, Notices,
// Manage students, Analytics) and the three enrollment numbers.
export default function ClassOverview({ cls, onCreateSession, onOption }) {
  const meta = TYPE_META[cls.type] || TYPE_META.Theory;
  const format = cls.paymentFormat || 'monthly';
  const price = effectivePrice(cls);
  return (
    <>
      <header className={s.overview}>
        {cls.bannerUrl && (
          <div className={s.banner} data-testid="class-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cls.bannerUrl} alt="" />
          </div>
        )}
        <div className={s.overviewTop}>
          <div className={s.overviewMain}>
            <div className={s.chips}>
              <span className={styles.typeChip} style={{ color: meta.color, background: meta.tint }}>
                <span className={styles.typeDot} style={{ background: meta.color }} aria-hidden="true" />
                {cls.type}
              </span>
              {cls.visible === false && (
                <span className={s.hiddenTag} data-testid="hidden-tag">
                  <Icon name="visibility_off" size={15} weight={600} />
                  Hidden from students
                </span>
              )}
            </div>
            <h1 className={s.className}>{classTitle(cls, cls.tutor)}</h1>
            <p className={s.classLine}>
              {cls.tutor.name} · {batchKey(cls)} · {cls.medium} medium
            </p>
            <p className={s.classLine}>{scheduleText(cls)}</p>
            {cls.description && (
              <p className={s.classInfo} data-testid="class-info">
                {cls.description}
              </p>
            )}
            <p className={s.classLine} data-testid="class-price">
              {priceText(price, format)}
              {cls.specialPrice ? (
                <>
                  {' '}
                  <s className={s.usualPrice} aria-label={`usual price ${formatLkr(cls.price)}`}>
                    {formatLkr(cls.price)}
                  </s>
                </>
              ) : null}
              {cls.admissionFee ? ` · ${formatLkr(cls.admissionFee)} admission fee` : ''}
            </p>
          </div>
          <button type="button" className={styles.primaryButton} onClick={onCreateSession}>
            <Icon name="add" size={20} weight={600} />
            Create session
          </button>
        </div>

        <div className={s.options} role="group" aria-label="Class options">
          {OPTIONS.map((option) => (
            <button key={option.key} type="button" className={s.optionButton} onClick={() => onOption(option.key)}>
              <Icon name={option.icon} size={19} weight={500} />
              {option.label}
            </button>
          ))}
        </div>
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
