'use client';

import Icon from '@/components/admin/Icon';
import { coverTint } from '@/study-packs/utils';
import styles from './study-packs.module.css';

// 16:9 cover used on the pack cards and in the store preview.
// An uploaded image fills it; otherwise it is a block tinted by subject.
// `children` are positioned over the cover (e.g. the status chip).
export default function PackCover({ coverUrl, subject, grade, children }) {
  if (coverUrl) {
    return (
      <div
        className={styles.cover}
        style={{ backgroundImage: `url(${JSON.stringify(coverUrl)})` }}
        role="img"
        aria-label="Study pack cover"
      >
        {children}
      </div>
    );
  }

  const tint = coverTint(subject);
  return (
    <div className={styles.cover} style={{ background: tint.bg, color: tint.ink }}>
      <span className={styles.coverIcon} aria-hidden="true">
        <Icon name="play_lesson" size={30} />
      </span>
      <div className={styles.coverText}>
        <span className={styles.coverSubject}>{subject ? subject.toUpperCase() : 'SUBJECT'}</span>
        <span className={styles.coverGrade}>{grade || 'Grade'}</span>
      </div>
      {children}
    </div>
  );
}
