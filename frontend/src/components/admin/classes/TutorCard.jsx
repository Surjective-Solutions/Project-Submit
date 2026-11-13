'use client';

import Link from 'next/link';
import { LEVEL_LABEL } from '@/classes/constants';
import { resetFiltersFor } from '@/classes/storage';
import { tutorHref } from '@/classes/utils';
import Avatar from './Avatar';
import LevelTag from './LevelTag';
import styles from './classes.module.css';

// The whole card is one link, so Enter and a click open the tutor; Space is added to match a button.
export default function TutorCard({ tutor }) {
  // The tutor's own "about me" text from their account; nothing is shown when they haven't written one.
  const description = String(tutor.description || '').trim();

  return (
    <Link
      href={tutorHref(tutor.id)}
      className={styles.tutorCard}
      aria-label={`Open ${tutor.name}, ${tutor.subject} ${LEVEL_LABEL[tutor.level] || tutor.level}`}
      onClick={() => resetFiltersFor(tutor.id)}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      <span className={styles.tutorTop}>
        <Avatar name={tutor.name} photoUrl={tutor.photoUrl} size={56} />
        <span className={styles.tutorText}>
          <span className={styles.tutorName}>{tutor.name}</span>
          <span className={styles.tutorSubject}>{tutor.subject}</span>
        </span>
        <LevelTag level={tutor.level} long />
      </span>

      {description && <span className={styles.tutorBio}>{description}</span>}

      <span className={styles.chips}>
        {(tutor.mediums || []).map((medium) => (
          <span key={medium} className={styles.chipCyan}>
            {medium}
          </span>
        ))}
      </span>
    </Link>
  );
}
