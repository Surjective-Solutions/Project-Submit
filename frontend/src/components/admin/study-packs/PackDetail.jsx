'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { coverTint, formatDuration, formatLkr, sessionsLabel, teacherName, validityLabel } from '@/study-packs/utils';
import styles from './study-packs.module.css';
import './PackDetail.css';

// The view a pack card grows into: a dimmed backdrop, the pack's cover and details, its sessions, and an Edit button.
// The card and this view share a view-transition-name (see StudyPacksPage), which is what makes the card morph into it.
//
// `items` is the pack's sessions, each with its recording attached (getPackItems).
// `canEdit` is false when the person may only look.
export default function PackDetail({ pack, teachers, items, canEdit = true, onClose, onEdit }) {
  const closeRef = useRef(null);
  const tint = coverTint(pack.subject);
  const hasCover = Boolean(pack.coverUrl);
  const ink = hasCover ? '#fff' : tint.ink;
  const teacher = teacherName(teachers, pack.teacherId);
  const published = pack.status === 'published';

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const facts = [
    ['Subject', pack.subject || 'Not set'],
    ['Teacher', teacher || 'Not set'],
    ['Price', Number(pack.price) > 0 ? formatLkr(pack.price) : 'Not set yet'],
    ['Access', validityLabel(pack.validity, pack.customDays)],
    ['Sessions', sessionsLabel(pack.sessions, pack.totalDuration)],
  ];

  // Rendered straight into <body>, so no page container can cut it off or offset it.
  return createPortal(
    <>
      <div
        className="pd-overlay"
        onClick={onClose}
        aria-hidden="true"
        style={{ viewTransitionName: 'pack-overlay' }}
      />
      <div className="pd-wrap">
        <article
          className="pd-card"
          role="dialog"
          aria-modal="true"
          aria-label={pack.name}
          data-pack-detail={pack.name}
          style={{ viewTransitionName: `pack-${pack.id}`, viewTransitionClass: 'pack-vt' }}
        >
          <header className="pd-hero" style={{ background: hasCover ? '#1c2554' : tint.bg, color: ink }}>
            {hasCover ? <img className="pd-cover" src={pack.coverUrl} alt="" /> : null}
            {hasCover ? <span className="pd-shade" aria-hidden="true" /> : null}
            <button ref={closeRef} type="button" className="pd-close" aria-label="Close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="pd-title">
              <span className="pd-kicker">{pack.grade || 'No grade yet'}</span>
              <h2>{pack.name}</h2>
              <span className={published ? 'pd-status pd-live' : 'pd-status'}>{published ? 'Published' : 'Draft'}</span>
            </div>
          </header>

          <div className="pd-body">
            <dl className="pd-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {pack.description ? <p className="pd-desc">{pack.description}</p> : null}

            <h3 className="pd-h">Sessions</h3>
            {items.length === 0 ? (
              <p className="pd-empty">No recordings in this pack yet.</p>
            ) : (
              <ol className="pd-sessions">
                {items.map((item) => (
                  <li key={item.recordingCode}>
                    <span className="pd-num">{item.order}</span>
                    <span className="pd-session-title">{item.title}</span>
                    {item.recording?.durationMins ? (
                      <span className="pd-session-meta">{formatDuration(item.recording.durationMins)}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}

            <div className="pd-actions">
              <button type="button" className={styles.neutralButton} onClick={onClose}>
                Close
              </button>
              {canEdit ? (
                <button type="button" className={styles.primaryButton} onClick={() => onEdit(pack)}>
                  Edit study pack
                </button>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </>,
    document.body
  );
}
