'use client';

import { useEffect, useState } from 'react';
import { photoSrc } from '@/admin-account/utils';
import { initialsOf } from '@/classes/utils';
import styles from './classes.module.css';

// Round tutor photo; the initials show when there is no photo or it fails to load.
// `profile` is the big version on the tutor page (white ring and outline instead of the thin ring).
export default function Avatar({ name, photoUrl, size = 56, profile = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoUrl]);

  const src = photoUrl && !failed ? photoSrc(photoUrl) : '';
  return (
    <span
      className={`${styles.avatar} ${profile ? styles.avatarProfile : ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      aria-hidden="true"
      data-testid="tutor-avatar"
    >
      {src ? <img className={styles.avatarImg} src={src} alt="" onError={() => setFailed(true)} /> : initialsOf(name)}
    </span>
  );
}
