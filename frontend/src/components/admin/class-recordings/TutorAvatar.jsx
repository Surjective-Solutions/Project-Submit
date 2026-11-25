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

// The server may send the level as "A/L", "G.C.E. Advanced Level", "Advanced Level"... This turns any of them into
// 'A/L' or 'O/L' (or '' when it is neither), so the tag, the filter and the counts all agree.
export function levelKey(level) {
  const text = String(level ?? '').toLowerCase();
  if (/(^|[^a-z])a\s*\/\s*l([^a-z]|$)|advanced/.test(text)) return 'A/L';
  if (/(^|[^a-z])o\s*\/\s*l([^a-z]|$)|ordinary/.test(text)) return 'O/L';
  return '';
}

// Always the short form (A/L or O/L), so a long level name never squeezes the tutor's name.
export function LevelTag({ level }) {
  const key = levelKey(level);
  const label = key || String(level ?? '');
  if (!label) return null;
  return <span className={`${styles.levelTag} ${key === 'O/L' ? styles.levelOL : styles.levelAL}`}>{label}</span>;
}
