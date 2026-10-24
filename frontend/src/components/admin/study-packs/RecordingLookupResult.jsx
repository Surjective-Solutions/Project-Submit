'use client';

import Icon from '@/components/admin/Icon';
import { coverTint, formatDuration, teacherName } from '@/study-packs/utils';
import { formatClassDate } from '@/study-packs/sessionUtils';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';

// What the lookup found, shown under the code field.
// result: null | { status: 'empty' | 'notfound' | 'error' | 'duplicate' | 'found', ... }
// mismatch: null | { recording: string, pack: string }
export default function RecordingLookupResult({ result, mismatch, teachers }) {
  if (!result) return null;

  if (result.status === 'empty') {
    return (
      <p className={base.errorText} role="alert">
        Enter a recording code.
      </p>
    );
  }

  if (result.status === 'notfound') {
    return (
      <div className={`${s.resultBox} ${s.resultError}`} role="alert">
        <Icon name="search_off" size={20} />
        <span>
          No recording found for <strong className={s.mono}>{result.code}</strong>. Check the code in Class Recordings
          and try again.
        </span>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className={`${s.resultBox} ${s.resultError}`} role="alert">
        <Icon name="error" size={20} />
        <span>Could not look up that code right now. Please try again.</span>
      </div>
    );
  }

  if (result.status === 'duplicate') {
    return (
      <div className={`${s.resultBox} ${s.resultWarn}`} role="status">
        <Icon name="content_copy" size={20} />
        <span>
          <strong className={s.mono}>{result.code}</strong> is already session {result.n} in this pack.
        </span>
      </div>
    );
  }

  const rec = result.recording;
  const tint = coverTint(rec.subject);
  const byline = [teacherName(teachers, rec.teacherId), rec.subject, rec.grade].filter(Boolean).join(' · ');

  return (
    <div className={mismatch ? `${s.foundBox} ${s.foundBoxWarn}` : s.foundBox} role="status">
      <div className={s.foundTop}>
        <div className={s.thumb} style={{ background: tint.bg, color: tint.ink }}>
          <Icon name="play_circle" size={40} fill={1} />
          <span className={s.durationBadge}>{formatDuration(rec.durationMins)}</span>
        </div>

        <div className={s.foundInfo}>
          <span className={s.foundChip}>
            <Icon name="check_circle" size={15} fill={1} />
            Recording found
          </span>
          <h3 className={s.foundTitle}>{rec.title}</h3>
          <span className={s.codeChip}>{rec.code}</span>
          <p className={s.foundMeta}>
            Class on {formatClassDate(rec.classDate)} · {rec.medium} medium
          </p>
          {byline ? <p className={s.foundMeta}>{byline}</p> : null}
        </div>
      </div>

      {mismatch ? (
        <div className={s.mismatch} role="alert">
          <Icon name="warning" size={18} fill={1} />
          <span>
            This recording is from {mismatch.recording}, but this pack is for {mismatch.pack}. Make sure it&apos;s the
            right code.
          </span>
        </div>
      ) : null}
    </div>
  );
}
