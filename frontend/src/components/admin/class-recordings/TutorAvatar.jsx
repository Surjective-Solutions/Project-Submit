'use client';

import { initials } from '@/class-recordings/utils';
import styles from './classRecordings.module.css';

// The tutor's photo, or their initials on a soft background when there is none.
export default function TutorAvatar({ tutor, size = 56 }) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {tutor.photoUrl ? <img className={styles.avatarImg} src={tutor.photoUrl} alt="" /> : initials(tutor.name)}
    </span>
  );
}

export function LevelTag({ level }) {
  return <span className={`${styles.levelTag} ${level === 'O/L' ? styles.levelOL : styles.levelAL}`}>{level}</span>;
}
