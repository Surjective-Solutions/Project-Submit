import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { TYPE_META } from '@/classes/constants';
import {
  batchKey,
  classHref,
  classTitle,
  formatFee,
  formatLkr,
  isPackage,
  modeText,
  packageDetails,
  scheduleText,
} from '@/classes/utils';
import styles from './classes.module.css';

// One class or package. A class opens its own page (the whole card is the link, through the title);
// a package has no page yet, so it only has the hover state.
// `catalog` is all of the tutor's classes, so a package can list what it includes whatever filter is on.
export default function ClassCard({ cls, tutor, catalog = [] }) {
  const meta = TYPE_META[cls.type] || TYPE_META.Theory;
  const bundle = isPackage(cls);
  const online = cls.mode === 'online';
  const details = bundle ? packageDetails(cls, catalog) : null;

  return (
    <article className={styles.classCard} data-type={cls.type}>
      <div className={styles.classTop}>
        <span className={styles.typeChip} style={{ color: meta.color, background: meta.tint }}>
          <span className={styles.typeDot} style={{ background: meta.color }} aria-hidden="true" />
          {cls.type}
        </span>
      </div>

      <h3 className={styles.classTitle}>
        {bundle ? (
          classTitle(cls, tutor)
        ) : (
          <Link href={classHref(cls.tutorId || tutor.id, cls.id)} className={styles.classLink}>
            {classTitle(cls, tutor)}
          </Link>
        )}
      </h3>
      <p className={styles.classSub}>
        {batchKey(cls)} · {cls.medium} medium
      </p>

      {bundle ? (
        <div className={styles.packageIncludes}>
          <span className={styles.packageLabel}>Includes</span>
          <ul className={styles.packageList}>
            {details.items.map((item) => (
              <li key={item.id}>
                <span
                  className={styles.typeDot}
                  style={{ background: (TYPE_META[item.type] || TYPE_META.Theory).color }}
                  aria-hidden="true"
                />
                <span className={styles.packageItem}>
                  <strong>{item.type}</strong>
                  <span>{scheduleText(item)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className={styles.classMeta}>
          <li>
            <Icon name="schedule" size={18} weight={500} />
            <span>{scheduleText(cls)}</span>
          </li>
          <li>
            <Icon name={online ? 'videocam' : 'location_on'} size={18} weight={500} />
            <span>{modeText(cls)}</span>
          </li>
        </ul>
      )}

      <div className={styles.classFooter}>
        <span className={styles.classFeeGroup}>
          <span className={styles.classFee}>{formatFee(cls.monthlyFee)}</span>
          {bundle && details.regularFee != null && (
            <span className={styles.feeWas}>
              <span className={styles.srOnly}>Instead of </span>
              {formatLkr(details.regularFee)}
            </span>
          )}
        </span>
        {bundle && details.saving > 0 && <span className={styles.saveBadge}>Save {formatLkr(details.saving)}</span>}
      </div>
    </article>
  );
}
