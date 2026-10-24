'use client';

import Icon from '@/components/admin/Icon';
import { formatEdited, formatLkr, sessionsLabel, teacherName, validityLabel } from '@/study-packs/utils';
import PackCover from './PackCover';
import styles from './study-packs.module.css';

export default function PackCard({ pack, teachers, onEdit }) {
  const published = pack.status === 'published';
  const byline = [teacherName(teachers, pack.teacherId), pack.subject].filter(Boolean).join(' · ');

  return (
    <article className={styles.card}>
      <PackCover coverUrl={pack.coverUrl} subject={pack.subject} grade={pack.grade}>
        <span className={`${styles.statusChip} ${published ? styles.chipPublished : styles.chipDraft}`}>
          <span className={styles.chipDot} aria-hidden="true" />
          {published ? 'Published' : 'Draft'}
        </span>
      </PackCover>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{pack.name}</h3>
        {byline ? <p className={styles.cardByline}>{byline}</p> : null}
        <ul className={styles.cardFacts}>
          <li>
            <Icon name="video_library" size={17} />
            <span>{sessionsLabel(pack.sessions, pack.totalDuration)}</span>
          </li>
          <li>
            <Icon name="schedule" size={17} />
            <span>{validityLabel(pack.validity, pack.customDays)}</span>
          </li>
        </ul>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardPriceBlock}>
          <span className={styles.cardPrice}>{formatLkr(pack.price)}</span>
          <span className={styles.cardSub}>Edited {formatEdited(pack.updatedAt)}</span>
        </div>
        <button type="button" className={styles.editButton} onClick={() => onEdit(pack)}>
          <Icon name="edit" size={16} weight={600} />
          Edit
        </button>
      </div>
    </article>
  );
}
